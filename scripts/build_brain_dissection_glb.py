#!/usr/bin/env python3
"""
Gera public/models/cerebrum-papez-v7.glb (e brain-hippocampus.glb):
- Preserva 100% a anatomia real, estruturação e relações espaciais originais do SPL/Harvard Brain Atlas:
  * Todos os giros e sulcos corticais individuais reais nos dois hemisférios (sem fundir giros).
  * Bordas dos giros e sulcos suavemente arredondadas (Taubin calibrado + micro-arredondamento normal
    + filtro local anti-espículas), sem deformar nem exagerar volumes.
  * Anteparo interno de substância branca (Model_2 / Model_41) recuado -1.35 mm por baixo do córtex,
    vedando 100% do fundo dos sulcos sem invadir nem alterar a superfície cortical.
  * Estruturas centrais com anatomia e relações originais fiéis:
    Corpo Caloso (Model_3004), Giro do Cíngulo, Fórnix + Trato Mamilotalâmico, Tálamo,
    Corpos Mamilares, Giro Parahipocampal e Hipocampo.
- TEXCOORD_0.x = gradiente contínuo de profundidade real (fundo profundo de sulcos/fendas = 1.0 ->
  paredes intermediárias -> superfície externa dos giros/estruturas = 0.0).
"""

import concurrent.futures
import json
import math
import pathlib
import re
import shutil
import struct
import urllib.request
from typing import Dict, List, Tuple

import numpy as np
from scipy.spatial import cKDTree

BASE_URL = "https://raw.githubusercontent.com/mhalle/spl-brain-atlas/HEAD/slicer/models"
ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
OUT_GLB_V7 = ROOT_DIR / "public" / "models" / "cerebrum-papez-v7.glb"
OUT_GLB_COMPAT = ROOT_DIR / "public" / "models" / "brain-hippocampus.glb"
OUT_META = ROOT_DIR / "public" / "models" / "brain-hippocampus-meta.json"
CACHE_DIR = ROOT_DIR / ".cache_spl_vtk"

CINGULATE_LEFT = {1002, 1010, 1023, 1026}
PARAHIPPO_LEFT = {1006, 1016}

FRONTAL_OFFSETS = {3, 12, 14, 17, 18, 19, 20, 24, 27, 28, 32}
PARIETAL_OCCIPITAL_OFFSETS = {2, 5, 8, 10, 11, 13, 21, 22, 23, 25, 26, 29, 31}
TEMPORAL_INSULA_OFFSETS = {0, 1, 6, 7, 9, 15, 16, 30, 33, 34, 35}

THALAMUS_LEFT = {501, 503, 505, 507, 509, 511, 513, 515, 517, 519, 521, 523, 525}


def fetch_tree_models() -> List[str]:
    req = urllib.request.Request(
        "https://api.github.com/repos/mhalle/spl-brain-atlas/git/trees/HEAD?recursive=1",
        headers={"User-Agent": "Hippocampus-Anatomical-Builder/7.0"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    names = []
    for item in data.get("tree", []):
        p = item.get("path", "")
        if p.startswith("slicer/models/Model_") and p.endswith(".vtk"):
            names.append(p.replace("slicer/models/", ""))
    return sorted(names)


def classify_models(all_names: List[str]) -> Dict[str, List[str]]:
    groups: Dict[str, List[str]] = {
        "wm_left": [],
        "wm_right": [],
        "cortex_left_temporal": [],
        "cortex_left_frontal": [],
        "cortex_left_parietal": [],
        "cortex_right_temporal": [],
        "cortex_right_frontal": [],
        "cortex_right_parietal": [],
        "papez_cingulate": [],
        "papez_callosum": [],
        "papez_parahippocampal": [],
        "papez_thalamus": [],
        "papez_mammillary": [],
        "papez_fornix": [],
        "hippocampus": [],
    }

    for name in all_names:
        num = int(name.split("_")[1])

        if num == 2:
            groups["wm_left"].append(name)
        elif num == 41:
            groups["wm_right"].append(name)
        elif num == 17:
            groups["hippocampus"].append(name)
        elif num in {3007, 3005, 100}:
            groups["papez_fornix"].append(name)
        elif num in {3003, 3002}:
            groups["papez_mammillary"].append(name)
        elif num in THALAMUS_LEFT:
            groups["papez_thalamus"].append(name)
        elif num == 3004:
            groups["papez_callosum"].append(name)
        elif num in CINGULATE_LEFT:
            groups["papez_cingulate"].append(name)
        elif num in PARAHIPPO_LEFT:
            groups["papez_parahippocampal"].append(name)
        elif 1000 <= num <= 1035 and num not in CINGULATE_LEFT and num not in PARAHIPPO_LEFT:
            off = num - 1000
            if off in FRONTAL_OFFSETS:
                groups["cortex_left_frontal"].append(name)
            elif off in PARIETAL_OCCIPITAL_OFFSETS:
                groups["cortex_left_parietal"].append(name)
            else:
                groups["cortex_left_temporal"].append(name)
        elif 2000 <= num <= 2035:
            off = num - 2000
            if off in FRONTAL_OFFSETS:
                groups["cortex_right_frontal"].append(name)
            elif off in PARIETAL_OCCIPITAL_OFFSETS:
                groups["cortex_right_parietal"].append(name)
            else:
                groups["cortex_right_temporal"].append(name)

    return groups


def download_vtk(name: str) -> bytes:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cached = CACHE_DIR / name
    if cached.exists() and cached.stat().st_size > 100:
        return cached.read_bytes()
    url = f"{BASE_URL}/{urllib.parse.quote(name)}"
    req = urllib.request.Request(url, headers={"User-Agent": "Hippocampus-Anatomical-Builder/7.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read()
    cached.write_bytes(raw)
    return raw


def parse_vtk_numpy(raw: bytes) -> Tuple[np.ndarray, np.ndarray]:
    m_pts = re.search(rb"POINTS\s+(\d+)\s+(float|double)\r?\n", raw)
    if not m_pts:
        raise ValueError("POINTS section not found in VTK")
    n_pts = int(m_pts.group(1))
    dtype = ">f4" if m_pts.group(2) == b"float" else ">f8"
    pts_start = m_pts.end()

    pts = np.frombuffer(raw, dtype=dtype, count=n_pts * 3, offset=pts_start).astype(np.float32).reshape(-1, 3)
    verts = np.column_stack((-pts[:, 1], pts[:, 2], -pts[:, 0])).astype(np.float32)

    tris: List[Tuple[int, int, int]] = []
    m_strips = re.search(rb"TRIANGLE_STRIPS\s+(\d+)\s+(\d+)\r?\n", raw)
    if m_strips:
        n_strips = int(m_strips.group(1))
        n_ints = int(m_strips.group(2))
        ints = np.frombuffer(raw, dtype=">i4", count=n_ints, offset=m_strips.end())
        idx = 0
        for _ in range(n_strips):
            cnt = int(ints[idx])
            strip = ints[idx + 1 : idx + 1 + cnt]
            idx += 1 + cnt
            for j in range(cnt - 2):
                a, b, c = (
                    (int(strip[j]), int(strip[j + 1]), int(strip[j + 2]))
                    if j % 2 == 0
                    else (int(strip[j + 1]), int(strip[j]), int(strip[j + 2]))
                )
                if a != b and b != c and a != c:
                    tris.append((a, b, c))

    m_polys = re.search(rb"POLYGONS\s+(\d+)\s+(\d+)\r?\n", raw)
    if m_polys:
        n_polys = int(m_polys.group(1))
        n_ints = int(m_polys.group(2))
        ints = np.frombuffer(raw, dtype=">i4", count=n_ints, offset=m_polys.end())
        idx = 0
        for _ in range(n_polys):
            cnt = int(ints[idx])
            poly = ints[idx + 1 : idx + 1 + cnt]
            idx += 1 + cnt
            p0 = int(poly[0])
            for j in range(1, cnt - 1):
                b, c = int(poly[j]), int(poly[j + 1])
                if p0 != b and b != c and p0 != c:
                    tris.append((p0, b, c))

    return verts, np.array(tris, dtype=np.int32)


def cluster_vertices(verts: np.ndarray, tris: np.ndarray, cell_size: float) -> Tuple[np.ndarray, np.ndarray]:
    if cell_size <= 0.0 or len(verts) == 0 or len(tris) == 0:
        return verts, tris

    keys = np.floor(verts / cell_size).astype(np.int64)
    kmin = keys.min(axis=0)
    krel = keys - kmin[None, :]
    span = krel.max(axis=0) + 1
    hash_1d = krel[:, 0] * (span[1] * span[2]) + krel[:, 1] * span[2] + krel[:, 2]

    _, inv, counts = np.unique(hash_1d, return_inverse=True, return_counts=True)
    n_new = len(counts)
    new_v = np.zeros((n_new, 3), dtype=np.float32)
    np.add.at(new_v, inv, verts)
    new_v /= counts[:, None].astype(np.float32)

    rt = inv[tris]
    valid = (rt[:, 0] != rt[:, 1]) & (rt[:, 1] != rt[:, 2]) & (rt[:, 0] != rt[:, 2])
    rt = rt[valid]
    if len(rt) == 0:
        return np.zeros((0, 3), dtype=np.float32), np.zeros((0, 3), dtype=np.int32)

    s_rt = np.sort(rt, axis=1).astype(np.int64)
    tri_hash = s_rt[:, 0] * (n_new * n_new) + s_rt[:, 1] * n_new + s_rt[:, 2]
    _, uniq_t = np.unique(tri_hash, return_index=True)
    return new_v, rt[np.sort(uniq_t)].astype(np.int32)


def compute_vertex_normals(verts: np.ndarray, tris: np.ndarray) -> np.ndarray:
    v0, v1, v2 = verts[tris[:, 0]], verts[tris[:, 1]], verts[tris[:, 2]]
    fn = np.cross(v1 - v0, v2 - v0)
    vn = np.zeros_like(verts)
    np.add.at(vn, tris[:, 0], fn)
    np.add.at(vn, tris[:, 1], fn)
    np.add.at(vn, tris[:, 2], fn)
    ln = np.linalg.norm(vn, axis=1, keepdims=True)
    return np.where(ln > 1e-8, vn / np.maximum(ln, 1e-8), np.array([0.0, 1.0, 0.0], dtype=np.float32))


def build_edges(tris: np.ndarray, n_v: int) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    edges = np.vstack(
        [tris[:, [0, 1]], tris[:, [1, 0]], tris[:, [1, 2]], tris[:, [2, 1]], tris[:, [2, 0]], tris[:, [0, 2]]]
    )
    ek = edges[:, 0].astype(np.int64) * n_v + edges[:, 1].astype(np.int64)
    _, uidx = np.unique(ek, return_index=True)
    edges = edges[uidx]
    src, dst = edges[:, 0], edges[:, 1]
    deg = np.bincount(src, minlength=n_v).astype(np.float32)
    inv_deg = np.where(deg > 0, 1.0 / np.maximum(deg, 1.0), 0.0)[:, None]
    return src, dst, inv_deg


def refine_anatomical_mesh(
    verts: np.ndarray,
    tris: np.ndarray,
    cell_size: float,
    spike_passes: int,
    taubin_passes: int,
    normal_offset_mm: float = 0.0,
    normal_smooth_passes: int = 3,
    lam: float = 0.38,
    mu: float = -0.395,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Preserva a anatomia real da malha e apenas arredonda suavemente bordas/cristas vivas,
    recolhendo espículas pontiagudas isoladas sem inflar nem fundir estruturas.
    """
    v, t = cluster_vertices(verts, tris, cell_size)
    n_v = len(v)
    if n_v == 0 or len(t) == 0:
        return v, np.zeros_like(v), np.zeros(0, dtype=np.float32), t

    src, dst, inv_deg = build_edges(t, n_v)
    has_nb = inv_deg[:, 0] > 0

    def nb_mean(arr: np.ndarray) -> np.ndarray:
        s = np.zeros_like(arr)
        np.add.at(s, src, arr[dst])
        return s * inv_deg

    # 1. Filtro seletivo anti-espículas: relaxa apenas vértices cujo desvio em relação à vizinhança é abrupto
    for _ in range(spike_passes):
        avg = nb_mean(v)
        diff = avg - v
        dist = np.linalg.norm(diff, axis=1, keepdims=True)
        # Vértices normais movem muito pouco (0.18); pontas agudas (> 0.9mm da vizinhança) relaxam mais (0.62)
        w = np.clip(0.18 + 0.44 * np.clip((dist - 0.55) / 1.1, 0.0, 1.0), 0.18, 0.62)
        v = np.where(has_nb[:, None], v + w * diff, v)

    # 2. Deslocamento normal sutil opcional (arredonda lábios dos giros ou recua anteparo interno)
    if abs(normal_offset_mm) > 1e-4:
        vn_pre = compute_vertex_normals(v, t)
        for _ in range(2):
            vn_pre = vn_pre + nb_mean(vn_pre) * 0.5
            ln = np.linalg.norm(vn_pre, axis=1, keepdims=True)
            vn_pre = np.where(ln > 1e-8, vn_pre / np.maximum(ln, 1e-8), vn_pre)
        v = v + vn_pre * normal_offset_mm

    # 3. Suavização Taubin preservadora de volume: arredonda bordas de sulcos e giros sem perder a forma
    for _ in range(taubin_passes):
        avg1 = nb_mean(v)
        v = np.where(has_nb[:, None], v + lam * (avg1 - v), v)
        avg2 = nb_mean(v)
        v = np.where(has_nb[:, None], v + mu * (avg2 - v), v)

    # 4. Normais suaves e concavidade multiescala (2-ring + 4-ring) para gradiente realista de profundidade
    vn = compute_vertex_normals(v, t)
    for _ in range(normal_smooth_passes):
        vn = vn + nb_mean(vn) * 0.45
        ln = np.linalg.norm(vn, axis=1, keepdims=True)
        vn = np.where(ln > 1e-8, vn / np.maximum(ln, 1e-8), vn)

    ring = v.copy()
    ring2 = v.copy()
    for step_i in range(4):
        ring = np.where(has_nb[:, None], nb_mean(ring), ring)
        if step_i == 1:
            ring2 = ring.copy()

    conc2 = np.clip(np.sum((ring2 - v) * vn, axis=1) * 0.52, 0.0, 1.0)
    conc4 = np.clip(np.sum((ring - v) * vn, axis=1) * 0.34, 0.0, 1.0)
    concav = np.clip(np.maximum(conc2, conc4), 0.0, 1.0).astype(np.float32)

    return v.astype(np.float32), vn.astype(np.float32), concav, t


def smooth_scalar_on_mesh(verts: np.ndarray, tris: np.ndarray, vals: np.ndarray, passes: int = 2) -> np.ndarray:
    n_v = len(verts)
    if n_v == 0 or len(tris) == 0:
        return vals
    src, dst, inv_deg = build_edges(tris, n_v)
    has_nb = inv_deg[:, 0] > 0
    cur = vals.astype(np.float32).copy()
    for _ in range(passes):
        s = np.zeros_like(cur)
        np.add.at(s, src, cur[dst])
        cur = np.where(has_nb, cur * 0.52 + (s * inv_deg[:, 0]) * 0.48, cur)
    return np.clip(cur, 0.0, 1.0)


def write_glb(
    group_meshes: Dict[str, Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]],
    out_path: pathlib.Path,
) -> Dict[str, object]:
    bin_chunks: List[bytes] = []
    buffer_views = []
    accessors = []
    meshes = []
    nodes = []
    meta_groups = {}
    byte_offset = 0

    def append_bin(data: bytes, target: int = None) -> int:
        nonlocal byte_offset
        pad = (4 - (len(data) % 4)) % 4
        padded = data + (b"\x00" * pad)
        bv = {"buffer": 0, "byteOffset": byte_offset, "byteLength": len(data)}
        if target is not None:
            bv["target"] = target
        bv_idx = len(buffer_views)
        buffer_views.append(bv)
        bin_chunks.append(padded)
        byte_offset += len(padded)
        return bv_idx

    for group_name, (verts, norms, sulcus_u, tris) in group_meshes.items():
        if len(verts) == 0 or len(tris) == 0:
            continue

        v_f32 = np.ascontiguousarray(verts, dtype="<f4")
        n_f32 = np.ascontiguousarray(norms, dtype="<f4")
        uv_arr = np.column_stack((sulcus_u, np.zeros(len(sulcus_u), dtype=np.float32)))
        uv_f32 = np.ascontiguousarray(uv_arr, dtype="<f4")

        vmin = v_f32.min(axis=0).tolist()
        vmax = v_f32.max(axis=0).tolist()
        centroid = [round(float(x), 5) for x in v_f32.mean(axis=0)]

        if len(v_f32) > 65535:
            idx_bytes = np.ascontiguousarray(tris, dtype="<u4").tobytes()
            idx_comp_type = 5125
        else:
            idx_bytes = np.ascontiguousarray(tris, dtype="<u2").tobytes()
            idx_comp_type = 5123

        pos_bv = append_bin(v_f32.tobytes(), 34962)
        nrm_bv = append_bin(n_f32.tobytes(), 34962)
        uv_bv = append_bin(uv_f32.tobytes(), 34962)
        idx_bv = append_bin(idx_bytes, 34963)

        pos_acc = len(accessors)
        accessors.append(
            {
                "bufferView": pos_bv,
                "componentType": 5126,
                "count": int(len(v_f32)),
                "type": "VEC3",
                "min": [float(x) for x in vmin],
                "max": [float(x) for x in vmax],
            }
        )
        nrm_acc = len(accessors)
        accessors.append({"bufferView": nrm_bv, "componentType": 5126, "count": int(len(n_f32)), "type": "VEC3"})
        uv_acc = len(accessors)
        accessors.append({"bufferView": uv_bv, "componentType": 5126, "count": int(len(uv_f32)), "type": "VEC2"})
        idx_acc = len(accessors)
        accessors.append(
            {"bufferView": idx_bv, "componentType": idx_comp_type, "count": int(len(tris) * 3), "type": "SCALAR"}
        )

        mesh_idx = len(meshes)
        meshes.append(
            {
                "name": group_name,
                "primitives": [
                    {
                        "attributes": {"POSITION": pos_acc, "NORMAL": nrm_acc, "TEXCOORD_0": uv_acc},
                        "indices": idx_acc,
                        "mode": 4,
                    }
                ],
            }
        )
        nodes.append({"name": group_name, "mesh": mesh_idx})

        meta_groups[group_name] = {
            "vertices": int(len(v_f32)),
            "triangles": int(len(tris)),
            "centroid": centroid,
            "boundsMin": [round(float(x), 5) for x in vmin],
            "boundsMax": [round(float(x), 5) for x in vmax],
        }

    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "Hippocampus Anatomical Fidelity Builder v7",
            "copyright": "SPL/NAC Brain Atlas — Brigham and Women's Hospital / Harvard Medical School (3D Slicer License)",
        },
        "scene": 0,
        "scenes": [{"name": "CerebrumAnatomicalPapezV7", "nodes": list(range(len(nodes)))}],
        "nodes": nodes,
        "meshes": meshes,
        "accessors": accessors,
        "bufferViews": buffer_views,
        "buffers": [{"byteLength": byte_offset}],
    }

    json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    json_bytes += b" " * ((4 - (len(json_bytes) % 4)) % 4)
    bin_blob = b"".join(bin_chunks)
    total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_blob)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "wb") as f:
        f.write(struct.pack("<III", 0x46546C67, 2, total_len))
        f.write(struct.pack("<II", len(json_bytes), 0x4E4F534A))
        f.write(json_bytes)
        f.write(struct.pack("<II", len(bin_blob), 0x004E4942))
        f.write(bin_blob)

    return meta_groups


def main() -> None:
    print("[1/4] Carregando malhas anatômicas do SPL Brain Atlas...")
    all_names = fetch_tree_models()
    groups = classify_models(all_names)
    selected = [m for lst in groups.values() for m in lst]

    raw_map: Dict[str, bytes] = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=14) as pool:
        fut_to_name = {pool.submit(download_vtk, name): name for name in selected}
        for fut in concurrent.futures.as_completed(fut_to_name):
            name = fut_to_name[fut]
            raw_map[name] = fut.result()

    parsed_groups: Dict[str, Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]] = {}

    print("[2/4] Refinando estruturas centrais (anatomia e relações originais + bordas suaves)...")
    # (weld_models, cell_size_mm, spike_passes, taubin_passes, normal_offset_mm)
    papez_cfg = {
        "papez_cingulate": (True, 1.55, 3, 11, 0.20),
        "papez_callosum": (True, 1.45, 2, 10, 0.18),
        "papez_parahippocampal": (True, 1.45, 3, 11, 0.20),
        "papez_thalamus": (True, 1.45, 3, 11, 0.22),
        "papez_mammillary": (False, 0.75, 2, 9, 0.18),
        "papez_fornix": (True, 1.05, 2, 10, 0.18),
        "hippocampus": (False, 0.95, 2, 9, 0.15),
    }

    central_trees: Dict[str, cKDTree] = {}
    for gname, (weld_all, cell_sz, spk_p, tau_p, n_off) in papez_cfg.items():
        if weld_all:
            vs_list, ts_list = [], []
            v_off = 0
            for mname in groups[gname]:
                vr, tr = parse_vtk_numpy(raw_map[mname])
                vs_list.append(vr)
                ts_list.append(tr + v_off)
                v_off += len(vr)
            mv = np.vstack(vs_list)
            mt = np.vstack(ts_list)
            gv, gn, gc, gt = refine_anatomical_mesh(mv, mt, cell_sz, spk_p, tau_p, normal_offset_mm=n_off)
        else:
            gv_l, gn_l, gc_l, gt_l = [], [], [], []
            v_off = 0
            for mname in groups[gname]:
                vr, tr = parse_vtk_numpy(raw_map[mname])
                vs, ns, cs, ts = refine_anatomical_mesh(vr, tr, cell_sz, spk_p, tau_p, normal_offset_mm=n_off)
                gv_l.append(vs)
                gn_l.append(ns)
                gc_l.append(cs)
                gt_l.append(ts + v_off)
                v_off += len(vs)
            gv = np.vstack(gv_l)
            gn = np.vstack(gn_l)
            gc = np.concatenate(gc_l)
            gt = np.vstack(gt_l)

        parsed_groups[gname] = (gv, gn, gc, gt)
        central_trees[gname] = cKDTree(gv)

    # Gradiente real de profundidade inter-estruturas + concavidade nas estruturas centrais
    central_keys = list(papez_cfg.keys())
    for k in central_keys:
        gv, gn, gc, gt = parsed_groups[k]
        min_d = np.full(len(gv), 999.0, dtype=np.float32)
        for ok in central_keys:
            if ok == k:
                continue
            d, _ = central_trees[ok].query(gv, k=1)
            min_d = np.minimum(min_d, d.astype(np.float32))
        crevice = np.clip(1.0 - min_d / 5.2, 0.0, 1.0) ** 1.35
        depth_attr = np.clip(np.maximum(crevice * 0.92, gc * 0.85), 0.0, 1.0)
        depth_attr = smooth_scalar_on_mesh(gv, gt, depth_attr, passes=2)
        parsed_groups[k] = (gv, gn, depth_attr, gt)
        print(f"  {k:24s}: {len(gv):6d} verts | {len(gt):6d} tris")

    all_central_tree = cKDTree(np.vstack([parsed_groups[k][0] for k in central_keys]))

    print("[3/4] Refinando giros e sulcos corticais reais + anteparo interno nos sulcos...")
    for side_prefix, wm_key in (("cortex_left_", "wm_left"), ("cortex_right_", "wm_right")):
        side_keys = [f"{side_prefix}frontal", f"{side_prefix}parietal", f"{side_prefix}temporal"]
        gyrus_list = []

        for gkey in side_keys:
            for mname in groups[gkey]:
                vr, tr = parse_vtk_numpy(raw_map[mname])
                # Preserva cada giro real, arredondando suavemente apenas suas cristas/bordas (+0.28 mm)
                vs, ns, cs, ts = refine_anatomical_mesh(
                    vr,
                    tr,
                    cell_size=2.35,
                    spike_passes=2,
                    taubin_passes=8,
                    normal_offset_mm=0.30,
                    normal_smooth_passes=2,
                )
                gyrus_list.append((gkey, vs, ns, cs, ts))

        gyrus_trees = [cKDTree(item[1]) for item in gyrus_list]

        # Anteparo interno de substância branca recuado -1.45 mm: veda 100% do fundo profundo dos sulcos
        wm_r_v, wm_r_t = parse_vtk_numpy(raw_map[groups[wm_key][0]])
        wm_v, wm_n, _, wm_t = refine_anatomical_mesh(
            wm_r_v,
            wm_r_t,
            cell_size=3.30,
            spike_passes=2,
            taubin_passes=8,
            normal_offset_mm=-1.45,
            normal_smooth_passes=2,
        )
        # No lado esquerdo, remove triângulos do anteparo que encostem no conjunto central de Papez
        if side_prefix == "cortex_left_":
            d_cent, _ = all_central_tree.query(wm_v, k=1)
            keep_wm = d_cent > 2.2
            wm_t = wm_t[keep_wm[wm_t[:, 0]] & keep_wm[wm_t[:, 1]] & keep_wm[wm_t[:, 2]]]

        wm_tree = cKDTree(wm_v)

        lobe_buckets: Dict[str, List[List[np.ndarray]]] = {k: [[], [], [], []] for k in side_keys}
        lobe_offsets: Dict[str, int] = {k: 0 for k in side_keys}

        for idx, (gkey, vs, ns, cs, ts) in enumerate(gyrus_list):
            min_inter = np.full(len(vs), 999.0, dtype=np.float32)
            v_min, v_max = vs.min(axis=0) - 6.0, vs.max(axis=0) + 6.0
            for jdx, tree in enumerate(gyrus_trees):
                if idx == jdx:
                    continue
                ov = gyrus_list[jdx][1]
                if (
                    v_max[0] < ov[:, 0].min()
                    or v_min[0] > ov[:, 0].max()
                    or v_max[1] < ov[:, 1].min()
                    or v_min[1] > ov[:, 1].max()
                    or v_max[2] < ov[:, 2].min()
                    or v_min[2] > ov[:, 2].max()
                ):
                    continue
                d, _ = tree.query(vs, k=1)
                min_inter = np.minimum(min_inter, d.astype(np.float32))

            d_wm, _ = wm_tree.query(vs, k=1)
            # Profundidade real: máxima no fundo do sulco (próximo à substância branca e paredes opostas),
            # decaindo suavemente até 0.0 na coroa externa do giro!
            sulcus_wall = np.clip(1.0 - min_inter / 5.4, 0.0, 1.0) ** 1.30
            sulcus_floor = np.clip(1.0 - d_wm.astype(np.float32) / 3.8, 0.0, 1.0) ** 1.25
            depth_val = np.clip(
                np.maximum(sulcus_wall * 0.88 + sulcus_floor * 0.32, cs * 0.72),
                0.0,
                1.0,
            )
            # Coroas externas distantes da substância branca permanecem limpas na superfície
            crown_expose = np.clip((d_wm.astype(np.float32) - 2.6) / 3.2, 0.0, 1.0)
            depth_val *= 1.0 - crown_expose * 0.55 * (1.0 - sulcus_wall)
            depth_val = smooth_scalar_on_mesh(vs, ts, depth_val, passes=2)

            b = lobe_buckets[gkey]
            off = lobe_offsets[gkey]
            b[0].append(vs)
            b[1].append(ns)
            b[2].append(depth_val)
            b[3].append(ts + off)
            lobe_offsets[gkey] += len(vs)

        # Particiona o anteparo interno de substância branca pelo lobo cortical mais próximo
        if len(wm_t) > 0:
            lobe_trees = {
                k: cKDTree(np.vstack(lobe_buckets[k][0])) for k in side_keys if lobe_buckets[k][0]
            }
            tri_centers = (wm_v[wm_t[:, 0]] + wm_v[wm_t[:, 1]] + wm_v[wm_t[:, 2]]) / 3.0
            best_d = np.full(len(wm_t), 999.0, dtype=np.float32)
            best_k = np.zeros(len(wm_t), dtype=np.int32)
            valid_keys = list(lobe_trees.keys())
            for k_i, k_name in enumerate(valid_keys):
                d_l, _ = lobe_trees[k_name].query(tri_centers, k=1)
                better = d_l < best_d
                best_d = np.where(better, d_l, best_d)
                best_k = np.where(better, k_i, best_k)

            for k_i, k_name in enumerate(valid_keys):
                sub_t = wm_t[best_k == k_i]
                if len(sub_t) == 0:
                    continue
                used_v, remapped = np.unique(sub_t, return_inverse=True)
                sub_v = wm_v[used_v]
                sub_n = wm_n[used_v]
                sub_s = np.full(len(sub_v), 0.96, dtype=np.float32)
                sub_tris = remapped.reshape(-1, 3).astype(np.int32)

                b = lobe_buckets[k_name]
                off = lobe_offsets[k_name]
                b[0].append(sub_v)
                b[1].append(sub_n)
                b[2].append(sub_s)
                b[3].append(sub_tris + off)
                lobe_offsets[k_name] += len(sub_v)

        for gkey in side_keys:
            b = lobe_buckets[gkey]
            mv = np.vstack(b[0])
            mn = np.vstack(b[1])
            ms = np.concatenate(b[2])
            mt = np.vstack(b[3])
            parsed_groups[gkey] = (mv, mn, ms, mt)
            print(f"  {gkey:24s}: {len(mv):6d} verts | {len(mt):6d} tris")

    print("[4/4] Normalizando escala fiel e gravando cerebrum-papez-v7.glb...")
    all_pts = np.vstack([g[0] for g in parsed_groups.values()])
    bmin, bmax = all_pts.min(axis=0), all_pts.max(axis=0)
    center = (bmin + bmax) * 0.5
    span = float(np.max(bmax - bmin))
    scale = 3.12 / span

    normalized_groups: Dict[str, Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]] = {}
    for gname, (gv, gn, gs, gt) in parsed_groups.items():
        nv = ((gv - center[None, :]) * scale).astype(np.float32)
        normalized_groups[gname] = (nv, gn.astype(np.float32), gs.astype(np.float32), gt)

    meta_groups = write_glb(normalized_groups, OUT_GLB_V7)
    shutil.copyfile(OUT_GLB_V7, OUT_GLB_COMPAT)

    papez_keys = [k for k in meta_groups if k.startswith("papez_") or k == "hippocampus"]
    p_pts = np.vstack([normalized_groups[k][0] for k in papez_keys])
    papez_center = [round(float(x), 5) for x in (p_pts.min(axis=0) + p_pts.max(axis=0)) * 0.5]

    OUT_META.write_text(
        json.dumps(
            {
                "source": "SPL/NAC Multimodal Brain Atlas (Harvard Medical School)",
                "license": "3D Slicer Open-Source License",
                "version": 7,
                "glbBytes": OUT_GLB_V7.stat().st_size,
                "papezCenter": papez_center,
                "groups": meta_groups,
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"OK: {OUT_GLB_V7.stat().st_size / 1024:.1f} KB | papezCenter={papez_center}")


if __name__ == "__main__":
    main()

import fs from 'fs';
import path from 'path';

const MANIFEST_PATH = 'src/data/medevoAuditManifest.json';
const VISION_RESULTS_PATH = 'scripts/medevo_vision_audit_results.json';

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error('❌ Manifest não encontrado:', MANIFEST_PATH);
  process.exit(1);
}

if (!fs.existsSync(VISION_RESULTS_PATH)) {
  console.error('❌ Resultados da visão não encontrados:', VISION_RESULTS_PATH);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const visionData = JSON.parse(fs.readFileSync(VISION_RESULTS_PATH, 'utf8'));

console.log('🔄 Sincronizando resultados do Gemini Vision no Manifesto...');
console.log(`Total de imagens auditadas no resultado de visão: ${visionData.summary.totalAudited}`);
console.log(`Total de hits confirmados: ${visionData.summary.detectedWithLogo}`);

// Mapeamento url -> visionResult
const urlToVision = new Map();
Object.values(visionData.results || {}).forEach(r => {
  if (r.url) urlToVision.set(r.url, r);
});

let updatedQuestions = 0;
let totalVisionHitsInManifest = 0;

manifest.questions = manifest.questions.map(q => {
  let hasVisionHit = false;
  const visionDetails = [];

  (q.images || []).forEach(img => {
    const vr = urlToVision.get(img.url);
    if (vr) {
      img.visionAudit = {
        audited: true,
        has_medevo: vr.has_medevo,
        confidence: vr.confidence,
        presence_type: vr.presence_type,
        location: vr.location,
        details: vr.details
      };
      if (vr.has_medevo) {
        hasVisionHit = true;
        visionDetails.push({
          url: img.url,
          presence_type: vr.presence_type,
          location: vr.location,
          confidence: vr.confidence,
          details: vr.details
        });
      }
    }
  });

  if (hasVisionHit) {
    q.hasVisionHit = true;
    q.visionHits = visionDetails;
    totalVisionHitsInManifest++;
  } else if (q.hasVisionHit === undefined) {
    q.hasVisionHit = false;
  }

  updatedQuestions++;
  return q;
});

// Atualiza o resumo do manifesto
manifest.summary.visionAuditedCount = visionData.summary.totalAudited;
manifest.summary.visionHitsCount = totalVisionHitsInManifest;

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log(`✅ Manifesto sincronizado com sucesso!`);
console.log(`   - Questões no manifesto com Vision Hit: ${totalVisionHitsInManifest}`);


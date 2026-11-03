import fs from 'fs';

// 1. Patch useDashboardLayout.ts
let layoutCode = fs.readFileSync('src/hooks/useDashboardLayout.ts', 'utf8');

const targetSnippet = `        const sorted = [...prev].sort((a, b) => a.order - b.order);
        const index = sorted.findIndex((c) => c.id === cardId);
        if (index === -1) return prev;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sorted.length) return prev;

        const temp = sorted[index];
        sorted[index] = sorted[targetIndex];
        sorted[targetIndex] = temp;`;

const replacementSnippet = `        const sorted = [...prev].sort((a, b) => a.order - b.order);
        const visible = sorted.filter((c) => c.isVisible !== false);
        const visIndex = visible.findIndex((c) => c.id === cardId);
        if (visIndex === -1) return prev;

        const targetVisIndex = direction === 'up' ? visIndex - 1 : visIndex + 1;
        if (targetVisIndex < 0 || targetVisIndex >= visible.length) return prev;

        const targetCard = visible[targetVisIndex];
        const cardIndex = sorted.findIndex((c) => c.id === cardId);
        const targetSortedIndex = sorted.findIndex((c) => c.id === targetCard.id);
        if (cardIndex === -1 || targetSortedIndex === -1) return prev;

        const tempOrder = sorted[cardIndex].order;
        sorted[cardIndex].order = sorted[targetSortedIndex].order;
        sorted[targetSortedIndex].order = tempOrder;
        sorted.sort((a, b) => a.order - b.order);`;

const normalizedLayout = layoutCode.replace(/\r\n/g, '\n');
const normalizedTarget = targetSnippet.replace(/\r\n/g, '\n');
const normalizedReplacement = replacementSnippet.replace(/\r\n/g, '\n');

if (normalizedLayout.includes(normalizedTarget)) {
  const updatedLayout = normalizedLayout.replace(normalizedTarget, normalizedReplacement);
  fs.writeFileSync('src/hooks/useDashboardLayout.ts', updatedLayout, 'utf8');
  console.log('✅ useDashboardLayout.ts atualizado com swap sensível a cards visíveis!');
} else {
  console.log('ℹ️ useDashboardLayout.ts já atualizado ou snippet não encontrado.');
}

// 2. Patch FigmaCardWrapper.tsx (Adiciona Alça Superior Central)
let wrapperCode = fs.readFileSync('src/components/dashboard/FigmaCardWrapper.tsx', 'utf8');
const topActionBarMarker = `{/* BARRA SUPERIOR DE AÇÕES NO TOPO DO CARD SELECIONADO */}`;
const topHandleSnippet = `{/* ALÇA SUPERIOR CENTRAL - Indicador Fino */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'none', 'top')}
            className="figma-control absolute -top-1 left-1/2 -translate-x-1/2 h-1.5 w-10 bg-blue-500 hover:bg-blue-600 rounded-full cursor-ns-resize z-50 shadow-xs hover:h-2 transition-all touch-none"
            title="Arraste para ajustar altura superior"
          />

          `;

const normalizedWrapper = wrapperCode.replace(/\r\n/g, '\n');
if (!normalizedWrapper.includes('ALÇA SUPERIOR CENTRAL')) {
  const updatedWrapper = normalizedWrapper.replace(topActionBarMarker, topHandleSnippet + topActionBarMarker);
  fs.writeFileSync('src/components/dashboard/FigmaCardWrapper.tsx', updatedWrapper, 'utf8');
  console.log('✅ FigmaCardWrapper.tsx atualizado com Alça Superior Central!');
} else {
  console.log('ℹ️ FigmaCardWrapper.tsx já possui Alça Superior Central.');
}


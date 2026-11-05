import fs from 'fs';

const filePath = 'src/components/QuestionCard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `    // Se o gabarito oficial já estiver carregado no objeto da questão ou deduzido via fallback:
    if (resolvedCorrectAnswer) {
      setIsAnswered(true);
      const isAnulada = Boolean(activeQuestion.isAnulada || resolvedCorrectAnswer === 'ANULADA');
      const isCorrect = isAnulada ? true : pendingSelected === resolvedCorrectAnswer;
      onAnswer(question.id, pendingSelected, isCorrect);
      setShowCommentary(true);
      return;
    }

    // Consulta segura e homologação em tempo real (utiliza o prefetch instantâneo se já iniciado)
    try {
      setIsSubmittingAnswer(true);
      setSolveError(null);

      const key = \`\${question.id}_\${pendingSelected}\`;
      let dataPromise = prefetchPromisesRef.current[key];
      if (!dataPromise) {
        dataPromise = fetch('/api/questions/solve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: question.id,
            selectedOption: pendingSelected
          })
        }).then((res) => res.json());
        prefetchPromisesRef.current[key] = dataPromise;
      }

      const data = await dataPromise;
      if (!data || !data.success) {
        if (data?.limitReached) {
          openUpgradeModal(null, true);
          return;
        }
        throw new Error(data?.error || 'Erro ao validar resolução da questão.');
      }

      setResolvedOverrides({
        correctAnswer: data.correctAnswer,
        commentary: data.commentary,
        options: data.options && data.options.length > 0 ? data.options : question.options,
        isAnulada: data.isAnulada
      });

      setIsAnswered(true);
      onAnswer(question.id, pendingSelected, data.isCorrect);
      setShowCommentary(true);`;

const replacement = `    // Se o gabarito oficial já estiver carregado no objeto da questão ou deduzido via fallback:
    if (resolvedCorrectAnswer) {
      setIsAnswered(true);
      const isAnulada = Boolean(activeQuestion.isAnulada || resolvedCorrectAnswer === 'ANULADA');
      const isCorrect = isAnulada ? true : pendingSelected === resolvedCorrectAnswer;
      fetch('/api/questions/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          selectedOption: pendingSelected,
          isPrefetch: false
        })
      }).catch((e) => console.warn('[QuestionCard] Erro ao sincronizar resposta no backend:', e));

      onAnswer(question.id, pendingSelected, isCorrect, { syncedRemotely: true });
      setShowCommentary(true);
      return;
    }

    // Confirmação oficial de resolução e persistência segura no backend (isPrefetch: false)
    try {
      setIsSubmittingAnswer(true);
      setSolveError(null);

      const confirmPromise = fetch('/api/questions/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          selectedOption: pendingSelected,
          isPrefetch: false
        })
      }).then((res) => res.json());

      const data = await confirmPromise;
      if (!data || !data.success) {
        if (data?.limitReached) {
          openUpgradeModal(null, true);
          return;
        }
        throw new Error(data?.error || 'Erro ao validar resolução da questão.');
      }

      setResolvedOverrides({
        correctAnswer: data.correctAnswer,
        commentary: data.commentary,
        options: data.options && data.options.length > 0 ? data.options : question.options,
        isAnulada: data.isAnulada
      });

      setIsAnswered(true);
      onAnswer(question.id, pendingSelected, data.isCorrect, { syncedRemotely: true });
      setShowCommentary(true);`;

const targetNorm = target.replace(/\r\n/g, '\n');
const replacementNorm = replacement.replace(/\r\n/g, '\n');
const contentNorm = content.replace(/\r\n/g, '\n');

if (contentNorm.includes(targetNorm)) {
  const updatedNorm = contentNorm.replace(targetNorm, replacementNorm);
  fs.writeFileSync(filePath, updatedNorm.replace(/\n/g, '\r\n'), 'utf8');
  console.log('QuestionCard updated successfully.');
} else {
  console.error('Target not found in QuestionCard.');
}

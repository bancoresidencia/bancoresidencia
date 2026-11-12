async function check() {
  const testPayload = [
    { id: '1', enunciado: 'Paciente com febre e tosse produtiva há 3 dias.', alternativas: 'A) Pneumonia | B) Asma', gabarito_oficial: 'Alternativa A' },
    { id: '2', enunciado: 'Dor epigástrica que melhora com alimentação.', alternativas: 'A) Úlcera péptica | B) Apendicite', gabarito_oficial: 'Alternativa A' }
  ];

  const subfocos = ['Pneumonia Adquirida na Comunidade', 'Doença Ulcerosa Péptica', 'Apendicite Aguda'];

  const t0 = Date.now();
  const res = await fetch('http://127.0.0.1:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen2.5:3b',
      messages: [
        { role: 'system', content: `Classifique as questões nos subfocos: ${JSON.stringify(subfocos)}. Responda ESTRITAMENTE em JSON: {"decisoes": [{"id": "id_da_questao", "subfoco_escolhido": "nome_do_subfoco"}]}` },
        { role: 'user', content: JSON.stringify(testPayload) }
      ],
      format: 'json',
      stream: false
    })
  });
  const data = await res.json();
  console.log(`Time: ${Date.now() - t0}ms`);
  console.log('Output:\n', data.message.content);
}
check();

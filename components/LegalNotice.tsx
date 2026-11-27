/** "Aviso importante": what CogniMente is and is not. Shown in Ajustes and on /aviso. */
export default function LegalNotice() {
  return (
    <div className="legal">
      <p className="legal-lead">
        O CogniMente é um <strong>jogo de estímulo à mente e de bem-estar</strong>. Ele não é um serviço de saúde,
        nem um dispositivo médico, nem um tratamento.
      </p>
      <ul className="legal-list">
        <li><strong>Não faz diagnóstico.</strong> O app não identifica, não trata e não previne nenhuma doença, como Alzheimer ou outras demências.</li>
        <li><strong>Não substitui atendimento.</strong> Ele não substitui consultas, exames, terapias nem o acompanhamento de médicos, psicólogos, fonoaudiólogos, terapeutas ocupacionais ou outros profissionais de saúde.</li>
        <li><strong>Não vale como atestado.</strong> O app não emite e não substitui atestados, laudos, receitas ou relatórios médicos. Pontos, gráficos e resumos não servem como documento nem como avaliação de saúde.</li>
        <li><strong>Resultado de jogo não é exame.</strong> O desempenho muda por muitos motivos, como cansaço, visão, sono ou costume com o celular. Sozinho, ele não indica nenhuma condição de saúde.</li>
        <li><strong>O registro de saúde é um diário.</strong> Água, sono, humor e movimento ficam anotados para você e para quem você autorizar. Nenhum profissional acompanha esses dados.</li>
      </ul>
      <p className="legal-help">
        Se você notar mudanças na memória, no humor ou na saúde, procure um profissional de saúde.
        Em caso de emergência, ligue <strong>192 (SAMU)</strong>.
      </p>
      <div className="legal-privacy">
        <div className="set-label">Seus dados</div>
        <p>
          Seus jogos, registros de saúde e fotos da família são usados só para o app funcionar.
          Só veem o seu progresso as pessoas que você permitir, e você pode tirar essa permissão quando quiser, em Ajustes.
        </p>
      </div>
    </div>
  )
}

import { CRITERIA, VotesState, Member, Proposal } from '../types';

export const generateReportText = (
  votes: VotesState, 
  members: Member[], 
  proposals: Proposal[]
): string => {
  let report = `EXEMPLO DE PREENCHIMENTO COMPLETO: MATRIZ DE ANÁLISE COMPARATIVA\n`;
  report += `(Este é o modelo final para o documento, com espaços para a avaliação de todos os ${members.length} integrantes)\n\n`;

  // Header Row - Dynamic
  report += `Critério de Avaliação`;
  proposals.forEach(p => {
    report += `\t${p.name}`;
  });
  report += `\n`;

  // Criteria Rows
  CRITERIA.forEach((criterion, cIndex) => {
    report += `\n${cIndex + 1}. ${criterion}`;

    proposals.forEach((proposal) => {
      report += `\t${proposal.descriptions[cIndex] || "Sem descrição definida."}<hr>Avaliações da Equipe:<br>`;
      
      members.forEach((member) => {
        const score = votes[member.id]?.[proposal.id]?.[cIndex];
        const displayScore = score ? ` ${score} ` : ' _ ';
        report += `${member.name}: Nota: [${displayScore}]/5<br>`;
      });
    });
    report += `\n`;
  });

  // Totals Row
  report += `\nPONTUAÇÃO TOTAL`;
  proposals.forEach((proposal) => {
    report += `\t`;
    let teamTotal = 0;
    let voteCount = 0;

    members.forEach((member) => {
      let memberSum = 0;
      let hasVotes = false;
      for (let i = 0; i < 4; i++) {
        const s = votes[member.id]?.[proposal.id]?.[i] || 0;
        if (s > 0) hasVotes = true;
        memberSum += s;
      }
      
      const displaySum = hasVotes ? `${memberSum}` : ' _ ';
      report += `Soma (${member.name.split(' ')[0]}): [ ${displaySum} ]/20<br>`;
      
      if (hasVotes) {
        teamTotal += memberSum;
        voteCount++;
      }
    });

    const average = voteCount > 0 ? (teamTotal / members.length).toFixed(1) : ' _ ';
    report += `<hr>MÉDIA DA EQUIPE: [ ${average} ]/20`;
  });

  return report;
};
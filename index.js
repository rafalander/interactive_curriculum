 document.addEventListener('DOMContentLoaded', () => {
      const root = document.body;

      // Theme toggle
      const themeBtn = document.getElementById('themeBtn');
      function toggleTheme(){
        const theme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', theme);
        if(themeBtn) themeBtn.setAttribute('aria-pressed', theme === 'dark' ? 'false' : 'true');
      }
      if(themeBtn) themeBtn.addEventListener('click', toggleTheme);

      // Copy email
      const copyBtn = document.getElementById('copyBtn');
      const email = document.getElementById('emailLink')?.getAttribute('href')?.replace('mailto:', '') || 'rafa.lander@hotmail.com';
      if(copyBtn){
        const copyLabel = copyBtn.querySelector('[data-copy-label]');
        copyBtn.addEventListener('click', async ()=>{
          try{
            await navigator.clipboard.writeText(email);
            if(copyLabel){
              const prev = copyLabel.textContent;
              copyLabel.textContent = 'Copiado';
              setTimeout(()=> { copyLabel.textContent = prev; }, 1400);
            }
          }catch(e){ alert('Não foi possível copiar. Use ctrl+c para copiar manualmente.'); }
        });
      }

      const searchBtn = document.getElementById('searchBtn');
      const qInput = document.getElementById('q');

      // Print / Save — Chrome: backdrop-filter + grid podem deixar <main> em branco no PDF; CSS em style.css (.print-fix)
      let printDetailsSnapshot = [];
      const printBtn = document.getElementById('printBtn');
      if(printBtn) printBtn.addEventListener('click', ()=>{
        if(qInput) qInput.value = '';
        document.querySelectorAll('#timeline .job').forEach((j) => { j.style.display = ''; });
        const details = Array.from(document.querySelectorAll('details'));
        printDetailsSnapshot = details.map(d => d.open);
        details.forEach((d) => { d.open = true; });
        document.documentElement.classList.add('print-prep');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.print();
          });
        });
      });
      window.addEventListener('afterprint', () => {
        document.documentElement.classList.remove('print-prep');
        const details = Array.from(document.querySelectorAll('details'));
        details.forEach((d, i) => {
          if(printDetailsSnapshot[i] !== undefined) d.open = printDetailsSnapshot[i];
        });
      });

      // Simple filter
      function filterJobs(){
        const q = qInput?.value.trim().toLowerCase();
        const jobs = document.querySelectorAll('#timeline .job');
        if(!q){ jobs.forEach(j=>{ j.style.display = ''; }); return }
        jobs.forEach(job => {
          const tags = (job.getAttribute('data-tags') || '').toLowerCase();
          const text = (job.innerText || '').toLowerCase();
          const match = tags.includes(q) || text.includes(q);
          job.style.display = match ? 'block' : 'none';
        });
      }
      if(searchBtn) searchBtn.addEventListener('click', filterJobs);
      if(qInput) qInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') filterJobs(); });

      // Age & birth date calculation — fix for undefined variable
      const nascimento = new Date(1993, 4, 6); // mês 4 = maio
      const hoje = new Date();
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      if (hoje.getMonth() < nascimento.getMonth() || (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }
      const divBorn = document.querySelector('.born');
      const divIdade = document.querySelector('.age');
      if(divIdade) divIdade.innerHTML = `<strong>Idade:</strong> ${idade} anos`;
      if(divBorn) divBorn.innerHTML = `<strong>Nasc.:</strong> ${nascimento.toLocaleDateString('pt-BR')}`;

      // Accessibility: expand details on click of job header (native <details> used)
      document.querySelectorAll('#timeline .job').forEach(job=>{ /* no-op: keep native behaviour */ });
      
      // Calcular tempo total de experiência a partir das datas das experiências
      const experiencias = [
        { inicio: '2025-06', fim: null },
        { inicio: '2022-07', fim: '2025-06' },
        { inicio: '2019-09', fim: '2022-03' },
        { inicio: '2018-11', fim: '2019-08' },
        { inicio: '2016-10', fim: '2017-10' },
        { inicio: '2014-03', fim: '2016-03' },
        { inicio: '2011-10', fim: '2013-05' }
      ];

      let totalMeses = 0;
      experiencias.forEach(exp => {
        const inicio = new Date(exp.inicio + '-01');
        const fim = exp.fim ? new Date(exp.fim + '-01') : hoje;
        let meses = (fim.getFullYear() - inicio.getFullYear()) * 12 + (fim.getMonth() - inicio.getMonth());
        if (meses < 0) meses = 0;
        totalMeses += meses;
      });

      const anos = Math.floor(totalMeses / 12);
      const meses = totalMeses % 12;
      const tempoTexto = meses > 0 ? `${anos} anos e ${meses} meses` : `${anos} anos`;

      const experienceSummaryEl = document.getElementById('experienceSummary');
      if(experienceSummaryEl){
        experienceSummaryEl.textContent = `Profissional com ${tempoTexto} de experiência em TI - suporte, infraestrutura e desenvolvimento`;
      }
    });
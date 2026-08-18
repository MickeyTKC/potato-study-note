/* study.js — 互動學習工具（發音・標記・筆記・測驗模式・進度・匯出）
   用法：在 HTML 中先設定 window.STUDY={key:'...',name:'...'}，再引入本檔。 */
(function () {
  'use strict';
  var cfg = window.STUDY || {};
  var key = cfg.key || 'icm-default';
  var stageName = cfg.name || '';

  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* ---------- 注入樣式 ---------- */
  var CSS = '#toolbar{position:sticky;top:0;z-index:50;background:#26241d;color:#f5f2e9;border-bottom:1px solid #3d3a30;display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:8px 14px;font-size:13px}'
    + '#toolbar .seg{display:flex;border:1px solid #4a463a;border-radius:5px;overflow:hidden}'
    + '#toolbar button{background:transparent;color:#d9d2bd;border:0;padding:5px 10px;cursor:pointer;font:inherit;border-radius:0}'
    + '#toolbar button.on{background:var(--accent);color:#fffdf6}'
    + '#toolbar button:hover{background:#3d3a30;color:#fffdf6}'
    + '#toolbar button.on:hover{background:var(--accent)}'
    + '#toolbar label{color:#a79e86;display:flex;align-items:center;gap:4px;font-size:12.5px}'
    + '#toolbar select{background:#3d3a30;color:#f5f2e9;border:1px solid #4a463a;border-radius:4px;padding:4px;font:inherit;font-size:12.5px}'
    + '#toolbar .sp{flex:1}'
    + '.toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#26241d;color:#f5f2e9;padding:8px 16px;border-radius:20px;font-size:13px;opacity:0;pointer-events:none;transition:opacity .25s;z-index:95}'
    + '.toast.show{opacity:1}'
    + '.acts{margin-left:auto;display:inline-flex;gap:4px;flex:none}'
    + '.acts button{background:var(--soft);border:1px solid var(--line);border-radius:4px;width:26px;height:26px;line-height:1;cursor:pointer;font-size:13px;color:var(--ink);padding:0;flex:none}'
    + '.acts button:hover{border-color:var(--accent);background:#fdf6e0}'
    + '.acts button.on{background:var(--accent);color:#fffdf6;border-color:var(--accent)}'
    + '.saycell{background:none;border:0;cursor:pointer;font-size:12px;margin-left:6px;padding:2px}'
    + '.saycell:hover{transform:scale(1.15)}'
    + '.row.starred{background:#fdf6e0;border-color:var(--accent)}'
    + '.starred{outline:1px solid var(--accent);outline-offset:2px}'
    + '.note-edit{display:none;margin:8px 0 2px 26px}'
    + '.note-edit.open{display:block}'
    + '.note-edit textarea{width:100%;min-height:52px;font:inherit;font-size:13.5px;background:#fbf8ef;border:1px solid var(--line);border-radius:6px;padding:8px;color:var(--ink);resize:vertical;box-sizing:border-box}'
    + '.note-edit .hint{font-size:11.5px;color:var(--muted);margin-top:2px}'
    + '.journal{position:fixed;right:14px;bottom:14px;width:340px;max-width:92vw;background:var(--surface);border:1px solid var(--line);border-top:3px solid var(--accent);border-radius:8px;box-shadow:0 4px 18px rgba(38,36,29,.18);z-index:80;display:none;flex-direction:column}'
    + '.journal .jh{display:flex;align-items:center;gap:8px;padding:10px 12px;font-weight:600;font-size:14px}'
    + '.journal .jh .hint{font-weight:400;color:var(--muted);font-size:11.5px}'
    + '.journal .jh .x{margin-left:auto;cursor:pointer;border:0;background:none;font-size:15px;color:var(--muted);padding:2px 6px}'
    + '.journal textarea{width:100%;min-height:140px;border:0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);font:inherit;font-size:13px;padding:10px 12px;resize:vertical;background:#fffdf6;color:var(--ink);box-sizing:border-box;outline:none}'
    + '.journal .jf{padding:8px 12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}'
    + '.journal .jf button{font:inherit;font-size:12.5px;background:var(--accent);color:#fffdf6;border:0;border-radius:4px;padding:5px 10px;cursor:pointer}'
    + '.journal .jf button:hover{background:#75591a}'
    + '.journal .jf .clr{background:transparent;color:var(--muted);border:1px solid var(--line)}'
    + '.journal .jf .cnt{margin-left:auto;font-size:11.5px;color:var(--muted)}'
    + 'body.tm-hidezh .zh,body.tm-hidezh td.zhcol,body.tm-hidezh .qa .a,body.tm-hidezh .timeline .d span{visibility:hidden}'
    + 'body.tm-hideen .term,body.tm-hideen .en,body.tm-hideen .phon,body.tm-hideen td.encol,body.tm-hideen .en-line{visibility:hidden}'
    + 'body.reveal .zh,body.reveal td.zhcol,body.reveal .qa .a,body.reveal .term,body.reveal .en,body.reveal .phon,body.reveal td.encol,body.reveal .en-line,body.reveal .timeline .d span{visibility:visible}'
    + 'body.sf-star .row:not(.starred),body.sf-star .script:not(.starred),body.sf-star .qlist li:not(.starred),body.sf-star .en-line:not(.starred){display:none}'
    + '@media print{#toolbar,.journal,.note-edit,.acts,.saycell,.toast{display:none!important}}'
    + '@media (max-width:640px){'
    + '#toolbar{flex-wrap:nowrap;overflow-x:auto;padding:6px 8px;gap:4px;scrollbar-width:none}'
    + '#toolbar::-webkit-scrollbar{display:none}'
    + '#toolbar button{white-space:nowrap;padding:6px 8px;font-size:12.5px}'
    + '#toolbar .seg{flex:none}'
    + '#toolbar select{font-size:12px}'
    + '.acts button{width:32px;height:32px;font-size:14px}'
    + '.note-edit{margin-left:0}'
    + '.journal{width:min(340px,96vw);right:8px;bottom:8px}'
    + '.journal .jh{padding:9px 10px}'
    + '.saycell{font-size:14px}'
    + '}'
    + 'button{-webkit-tap-highlight-color:transparent}';
  try {
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
  } catch (e) {}

  /* ---------- 提示訊息 ---------- */
  function toast(msg) {
    try {
      var t = document.getElementById('toast');
      if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(t._tm);
      t._tm = setTimeout(function () { t.classList.remove('show'); }, 1800);
    } catch (e) {}
  }

  /* ---------- 語音發音 ---------- */
  var rate = lsGet(key + '-rate', 0.95);
  var voices = [];
  function loadVoices() { try { voices = (window.speechSynthesis ? speechSynthesis.getVoices() : []) || []; } catch (e) { voices = []; } }
  if (window.speechSynthesis) {
    loadVoices();
    try { speechSynthesis.onvoiceschanged = loadVoices; } catch (e) {}
  }
  function pickVoice() {
    var en = voices.filter(function (v) { return /^en[-_]?/i.test(v.lang || ''); });
    return en.filter(function (v) { return /google/i.test(v.name || ''); })[0]
      || en.filter(function (v) { return /natural|zira|david|samantha|daniel|kate|susan/i.test(v.name || ''); })[0]
      || en[0] || null;
  }
  function speak(text) {
    text = (text || '').replace(/\s+/g, ' ').trim();
    if (!text) return;
    if (!window.speechSynthesis) { toast('此瀏覽器不支援發音'); return; }
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = rate;
      var v = pickVoice();
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { toast('發音失敗：' + e.message); }
  }

  /* ---------- 逐項操作：發音・標記・筆記 ---------- */
  var seq = 0;
  var notes = lsGet(key + '-notes', {});
  var stars = lsGet(key + '-stars', []);
  var rows = Array.prototype.slice.call(document.querySelectorAll('.row, .script, .qlist li, .en-line'));

  function rowSayText(el) {
    var t = el.querySelector('.term, .en');
    if (t && t.textContent.trim()) return t.textContent;
    try {
      var c = el.cloneNode(true);
      var b = c.querySelector('b');
      if (b) b.remove();
      return c.textContent;
    } catch (e) { return el.textContent || ''; }
  }

  rows.forEach(function (el) {
    var idx = ++seq;
    try { el.dataset.k = String(idx); } catch (e) {}
    var sayText = rowSayText(el);
    var starred = stars.indexOf(idx) >= 0;
    if (starred) el.classList.add('starred');

    var acts = document.createElement('span');
    acts.className = 'acts';

    function mkBtn(sym, tip, fn) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = sym;
      b.title = tip;
      b.setAttribute('aria-label', tip);
      b.addEventListener('click', function (e) { e.stopPropagation(); fn(b); });
      return b;
    }

    acts.appendChild(mkBtn('\uD83D\uDD0A', '發音', function () { speak(sayText); }));

    acts.appendChild(mkBtn(starred ? '\u2605' : '\u2606', '標記重點', function (b) {
      var i = stars.indexOf(idx);
      if (i >= 0) {
        stars.splice(i, 1);
        el.classList.remove('starred');
        b.textContent = '\u2606';
        b.classList.remove('on');
      } else {
        stars.push(idx);
        el.classList.add('starred');
        b.textContent = '\u2605';
        b.classList.add('on');
      }
      lsSet(key + '-stars', stars);
    }));

    acts.appendChild(mkBtn('\u270E', '筆記', function () {
      var ed = el.querySelector('.note-edit');
      if (!ed) {
        ed = document.createElement('div');
        ed.className = 'note-edit';
        var ta = document.createElement('textarea');
        ta.placeholder = '寫低你覺得有趣嘅嘢…（自動儲存）';
        ta.value = notes[idx] || '';
        ta.addEventListener('input', function () { notes[idx] = ta.value; lsSet(key + '-notes', notes); });
        var h = document.createElement('div');
        h.className = 'hint';
        h.textContent = '輸入後自動儲存 ｜ 再按「✎」收起';
        ed.appendChild(ta);
        ed.appendChild(h);
        el.appendChild(ed);
      }
      ed.classList.toggle('open');
      if (ed.classList.contains('open')) {
        var t = ed.querySelector('textarea');
        if (t) t.focus();
      }
    }));

    var label = el.querySelector('label');
    if (label) label.appendChild(acts);
    else {
      var w = el.querySelector('.who');
      (w || el).appendChild(acts);
    }
  });

  /* ---------- 表格：標記中／英文欄位 + 英文發音按鈕 ---------- */
  Array.prototype.slice.call(document.querySelectorAll('table')).forEach(function (tbl) {
    var head = tbl.querySelector('tr');
    if (!head) return;
    Array.prototype.slice.call(head.children).forEach(function (c, ci) {
      var htxt = (c.textContent || '').trim();
      var isZh = /中文/.test(htxt);
      var isEn = /英文/.test(htxt);
      if (!isZh && !isEn) return;
      Array.prototype.slice.call(tbl.querySelectorAll('tr')).forEach(function (r, ri) {
        var td = r.children[ci];
        if (!td) return;
        if (isZh) td.classList.add('zhcol');
        if (isEn) td.classList.add('encol');
        if (isEn && ri > 0) {
          var b = document.createElement('button');
          b.type = 'button';
          b.textContent = '\uD83D\uDD0A';
          b.className = 'saycell';
          b.title = '發音';
          b.setAttribute('aria-label', '發音');
          b.addEventListener('click', function (e) { e.stopPropagation(); speak(td.textContent.replace(/\uD83D\uDD0A/g, '').trim()); });
          td.appendChild(b);
        }
      });
    });
  });

  /* ---------- 工具列 ---------- */
  var tb = document.getElementById('toolbar');
  if (tb) {
    var mode = lsGet(key + '-mode', 'study');
    var starFilter = lsGet(key + '-sf', false);
    var reveal = lsGet(key + '-reveal', false);
    var segBtns = {};

    function mkToolBtn(txt, fn) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = txt;
      b.addEventListener('click', fn);
      return b;
    }

    var seg = document.createElement('div');
    seg.className = 'seg';
    [['study', '學習'], ['hidezh', '測驗・藏中文'], ['hideen', '測驗・藏英文']].forEach(function (m) {
      var b = mkToolBtn(m[1], function () { mode = m[0]; lsSet(key + '-mode', mode); apply(); });
      b.dataset.mode = m[0];
      seg.appendChild(b);
      segBtns[m[0]] = b;
    });
    tb.appendChild(seg);

    var revBtn = mkToolBtn('顯示答案', function () { reveal = !reveal; lsSet(key + '-reveal', reveal); apply(); });
    tb.appendChild(revBtn);

    var sfBtn = mkToolBtn('★ 只看標記', function () { starFilter = !starFilter; lsSet(key + '-sf', starFilter); apply(); });
    tb.appendChild(sfBtn);

    var rw = document.createElement('label');
    rw.textContent = '語速';
    var sel = document.createElement('select');
    [[0.75, '慢'], [0.95, '正常'], [1.1, '快']].forEach(function (o) {
      var op = document.createElement('option');
      op.value = String(o[0]);
      op.textContent = o[1];
      sel.appendChild(op);
    });
    sel.value = String(rate);
    sel.addEventListener('change', function () { rate = parseFloat(sel.value); lsSet(key + '-rate', rate); });
    rw.appendChild(sel);
    tb.appendChild(rw);

    var jb = mkToolBtn('我的筆記', function () { toggleJournal(); });
    tb.appendChild(jb);

    function apply() {
      document.body.classList.remove('tm-hidezh', 'tm-hideen', 'sf-star', 'reveal');
      if (mode === 'hidezh') document.body.classList.add('tm-hidezh');
      if (mode === 'hideen') document.body.classList.add('tm-hideen');
      if (starFilter) document.body.classList.add('sf-star');
      if (reveal && mode !== 'study') document.body.classList.add('reveal');
      if (segBtns.study) segBtns.study.classList.toggle('on', mode === 'study');
      if (segBtns.hidezh) segBtns.hidezh.classList.toggle('on', mode === 'hidezh');
      if (segBtns.hideen) segBtns.hideen.classList.toggle('on', mode === 'hideen');
      sfBtn.classList.toggle('on', !!starFilter);
      revBtn.classList.toggle('on', !!reveal);
      revBtn.textContent = reveal ? '隱藏答案' : '顯示答案';
      if (rows.length === 0 && seg) seg.style.display = 'none';
    }
    apply();
  }

  /* ---------- 進度（已記住） ---------- */
  var boxes = Array.prototype.slice.call(document.querySelectorAll('input.done'));
  var bar = document.getElementById('prog');
  var lab = document.getElementById('prog-lab');
  function saveProg() {
    try {
      localStorage.setItem(key, JSON.stringify(boxes.map(function (b) { return b.checked; })));
      var n = boxes.filter(function (b) { return b.checked; }).length;
      var t = boxes.length;
      if (bar) bar.style.width = (t ? Math.round(n / t * 100) : 0) + '%';
      if (lab) lab.textContent = t ? n + ' / ' + t + ' 已記住' : '';
    } catch (e) {}
  }
  boxes.forEach(function (b) { b.addEventListener('change', saveProg); });
  saveProg();

  /* ---------- 我的筆記（浮動面板） ---------- */
  var journal = lsGet(key + '-journal', '');
  var jEl = document.createElement('div');
  jEl.className = 'journal';
  jEl.innerHTML = '<div class="jh">\uD83D\uDCDD 我的筆記 <span class="hint">' + stageName + '</span>'
    + '<button class="x" title="收埋">\u2715</button></div>'
    + '<textarea placeholder="記低有趣嘅內容、新詞、諗法…（自動儲存）"></textarea>'
    + '<div class="jf"><button class="dl">\u2B07 下載筆記</button>'
    + '<button class="clr">清空</button><span class="cnt"></span></div>';
  document.body.appendChild(jEl);
  var jTa = jEl.querySelector('textarea');
  var jCnt = jEl.querySelector('.cnt');
  function jSave() {
    if (!jTa) return;
    journal = jTa.value;
    lsSet(key + '-journal', journal);
    if (jCnt) jCnt.textContent = journal.length + ' 字（已儲存）';
  }
  function toggleJournal() {
    var show = jEl.style.display === 'none';
    jEl.style.display = show ? 'flex' : 'none';
    if (show && jTa) jTa.focus();
  }
  if (jTa) {
    jTa.value = journal;
    jTa.addEventListener('input', jSave);
  }
  var jx = jEl.querySelector('.x');
  if (jx) jx.addEventListener('click', toggleJournal);
  var jclr = jEl.querySelector('.clr');
  if (jclr) jclr.addEventListener('click', function () {
    if (window.confirm('確定清空全部筆記？')) { if (jTa) jTa.value = ''; jSave(); }
  });
  var jdl = jEl.querySelector('.dl');
  if (jdl) jdl.addEventListener('click', exportNotes);
  jSave();

  /* ---------- 匯出筆記 ---------- */
  function exportNotes() {
    try {
      var lines = [];
      lines.push('== ' + (stageName || key) + ' 筆記匯出 ==');
      lines.push('匯出時間：' + new Date().toLocaleString());
      lines.push('');
      if (journal.trim()) { lines.push('【我的筆記】'); lines.push(journal); lines.push(''); }
      var starred = rows.filter(function (el) { return el.classList.contains('starred'); });
      if (starred.length) {
        lines.push('【標記重點 ' + starred.length + ' 項】');
        starred.forEach(function (el) {
          var t = el.querySelector('.term, .en');
          var z = el.querySelector('.zh');
          lines.push('\u2022 ' + (t ? t.textContent.trim() : '') + (z ? ' — ' + z.textContent.trim() : ''));
        });
        lines.push('');
      }
      var any = false;
      rows.forEach(function (el) {
        var k = el.dataset.k;
        if (!k) return;
        var v = notes[k];
        if (!v || !v.trim()) return;
        var t = el.querySelector('.term, .en');
        lines.push('\u2022 ' + (t ? t.textContent.trim() : '') + '：' + v);
        any = true;
      });
      if (any) lines.push('');
      if (lines.length <= 3) lines.push('（暫無筆記內容）');
      var blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (stageName || key).replace(/[^\w\u4e00-\u9fff-]+/g, '-').replace(/^-+|-+$/g, '') + '-notes.txt';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        try { URL.revokeObjectURL(a.href); } catch (e) {}
        if (a.parentNode) a.parentNode.removeChild(a);
      }, 800);
      toast('筆記已下載');
    } catch (e) { toast('匯出失敗：' + e.message); }
  }
})();

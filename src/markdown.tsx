import type { ReactNode } from 'react';

// The notes format used for topics. Keep these rules in step with the dashboard (admin site, js/md.js).
//   ## Heading   ### Sub-heading   **bold**   *italic*   - bullet   1. numbered   > callout   | table | rows |
// Text is always rendered as React text nodes, never as HTML, so pasted notes cannot run code.

type Inline = { k: 't' | 'b' | 'i' | 'bi' | 'c'; s: string };
type Block =
  | { t: 'h'; l: 2 | 3; inl: Inline[] }
  | { t: 'p'; inl: Inline[] }
  | { t: 'hr' }
  | { t: 'q'; paras: Inline[][] }
  | { t: 'ul' | 'ol'; start: number; items: Inline[][] }
  | { t: 'tbl'; head: Inline[][]; rows: Inline[][][] };

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  let i = 0;
  let buf = '';
  const flush = () => {
    if (buf) {
      out.push({ k: 't', s: buf });
      buf = '';
    }
  };
  while (i < s.length) {
    const rest = s.slice(i);
    let m = rest.match(/^\*\*\*([^\s*](?:[^*]*[^\s*])?)\*\*\*/);
    if (m) {
      flush();
      out.push({ k: 'bi', s: m[1] });
      i += m[0].length;
      continue;
    }
    m = rest.match(/^\*\*([^\s*](?:[^*]*[^\s*])?)\*\*/);
    if (m) {
      flush();
      out.push({ k: 'b', s: m[1] });
      i += m[0].length;
      continue;
    }
    m = rest.match(/^\*([^\s*](?:[^*]*[^\s*])?)\*/);
    if (m) {
      flush();
      out.push({ k: 'i', s: m[1] });
      i += m[0].length;
      continue;
    }
    m = rest.match(/^`([^`\n]+)`/);
    if (m) {
      flush();
      out.push({ k: 'c', s: m[1] });
      i += m[0].length;
      continue;
    }
    if (rest[0] === '\\' && rest.length > 1 && '*`|\\'.includes(rest[1])) {
      buf += rest[1];
      i += 2;
      continue;
    }
    buf += rest[0];
    i += 1;
  }
  flush();
  return out;
}

function splitRow(line: string): string[] {
  let t = line.trim();
  if (t[0] === '|') t = t.slice(1);
  if (t[t.length - 1] === '|' && t[t.length - 2] !== '\\') t = t.slice(0, -1);
  const cells: string[] = [];
  let cur = '';
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '\\' && t[i + 1] === '|') {
      cur += '|';
      i++;
      continue;
    }
    if (t[i] === '|') {
      cells.push(cur.trim());
      cur = '';
      continue;
    }
    cur += t[i];
  }
  cells.push(cur.trim());
  return cells;
}

const isSep = (l: string) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(l) && l.includes('-');
const isBullet = (l: string) => /^\s*[-*•]\s+\S/.test(l);
const isOrdered = (l: string) => /^\s*\d{1,3}[.)]\s+\S/.test(l);
const startsBlock = (l: string, next?: string) =>
  /^\s*#{1,3}\s+\S/.test(l) || /^\s*>/.test(l) || isBullet(l) || isOrdered(l) || /^\s*-{3,}\s*$/.test(l) || (/^\s*\|/.test(l) && next !== undefined && isSep(next));

export function parseNotes(text: string): Block[] {
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const m = line.match(/^\s*(#{1,3})\s+(.*\S)\s*$/);
    if (m) {
      blocks.push({ t: 'h', l: m[1].length >= 3 ? 3 : 2, inl: parseInline(m[2].replace(/\s*#+\s*$/, '')) });
      i++;
      continue;
    }
    if (/^\s*-{3,}\s*$/.test(line)) {
      blocks.push({ t: 'hr' });
      i++;
      continue;
    }
    if (/^\s*\|/.test(line) && i + 1 < lines.length && isSep(lines[i + 1])) {
      const head = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      const n = head.length;
      blocks.push({
        t: 'tbl',
        head: head.map(parseInline),
        rows: rows.map((r) => {
          const x = r.slice(0, n);
          while (x.length < n) x.push('');
          return x.map(parseInline);
        }),
      });
      continue;
    }
    if (/^\s*>/.test(line)) {
      const parts: string[] = [];
      let cur: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        const c = lines[i].replace(/^\s*>\s?/, '');
        if (!c.trim()) {
          if (cur.length) parts.push(cur.join(' '));
          cur = [];
        } else cur.push(c.trim());
        i++;
      }
      if (cur.length) parts.push(cur.join(' '));
      blocks.push({ t: 'q', paras: parts.map(parseInline) });
      continue;
    }
    if (isBullet(line) || isOrdered(line)) {
      const ordered = isOrdered(line);
      const items: string[] = [];
      const start = ordered ? parseInt((line.match(/^\s*(\d+)/) as RegExpMatchArray)[1], 10) : 1;
      while (i < lines.length) {
        const l = lines[i];
        if (ordered ? isOrdered(l) : isBullet(l)) {
          items.push(l.replace(ordered ? /^\s*\d{1,3}[.)]\s+/ : /^\s*[-*•]\s+/, '').trim());
          i++;
        } else if (!l.trim()) {
          let j = i;
          while (j < lines.length && !lines[j].trim()) j++;
          if (j < lines.length && (ordered ? isOrdered(lines[j]) : isBullet(lines[j])) && j - i <= 1) i = j;
          else break;
        } else if (/^\s{2,}\S/.test(l) && items.length) {
          items[items.length - 1] += ' ' + l.trim();
          i++;
        } else break;
      }
      blocks.push({ t: ordered ? 'ol' : 'ul', start, items: items.map(parseInline) });
      continue;
    }
    const para = [line.trim()];
    i++;
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i], lines[i + 1])) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push({ t: 'p', inl: parseInline(para.join(' ')) });
  }
  return blocks;
}

function renderInline(parts: Inline[]): ReactNode[] {
  return parts.map((p, i) => {
    if (p.k === 't') return p.s;
    if (p.k === 'c') return <code key={i}>{p.s}</code>;
    if (p.k === 'i') return <em key={i}>{p.s}</em>;
    if (p.k === 'bi')
      return (
        <strong key={i}>
          <em>{p.s}</em>
        </strong>
      );
    return <strong key={i}>{p.s}</strong>;
  });
}

export default function Markdown({ text }: { text: string }) {
  const blocks = parseNotes(text);
  return (
    <div className='prose'>
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'h':
            return b.l === 3 ? <h4 key={i}>{renderInline(b.inl)}</h4> : <h3 key={i}>{renderInline(b.inl)}</h3>;
          case 'p':
            return <p key={i}>{renderInline(b.inl)}</p>;
          case 'hr':
            return <hr key={i} />;
          case 'q':
            return (
              <blockquote key={i} className='callout'>
                {b.paras.map((p, j) => (
                  <p key={j}>{renderInline(p)}</p>
                ))}
              </blockquote>
            );
          case 'ul':
            return (
              <ul key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={i} start={b.start}>
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ol>
            );
          case 'tbl':
            return (
              <div key={i} className='tbl-wrap'>
                <table>
                  <thead>
                    <tr>
                      {b.head.map((c, j) => (
                        <th key={j}>{renderInline(c)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j}>
                        {r.map((c, k) => (
                          <td key={k}>{renderInline(c)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}

import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, LocateFixed } from 'lucide-react';
import { statusMeta } from '../lib/constants';

function buildTree(employees) {
  const map = {};
  employees.forEach((e) => { map[e.id] = { ...e, children: [] }; });
  const roots = [];
  employees.forEach((e) => {
    if (e.reportsTo && map[e.reportsTo]) map[e.reportsTo].children.push(map[e.id]);
    else roots.push(map[e.id]);
  });
  return roots;
}

// Builds a tree scoped to one employee: themself + every descendant. Their
// own manager (N+1) is returned separately as a single read-only node so a
// person can see who they report to, but never anyone above that.
function buildScopedTree(employees, scopeId) {
  const map = {};
  employees.forEach((e) => { map[e.id] = { ...e, children: [] }; });
  employees.forEach((e) => {
    if (e.reportsTo && map[e.reportsTo]) map[e.reportsTo].children.push(map[e.id]);
  });
  const self = map[scopeId];
  const managerId = self?.reportsTo;
  const manager = managerId && map[managerId] ? { ...map[managerId], children: [] } : null;
  return { self, manager };
}

export default function OrgTree({ employees, onSelect, scopeEmployeeId = null }) {
  const scoped = scopeEmployeeId ? buildScopedTree(employees, scopeEmployeeId) : null;
  const roots = useMemo(() => scopeEmployeeId ? [] : buildTree(employees), [employees, scopeEmployeeId]);

  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const wrapRef = useRef(null);
  const contentRef = useRef(null);

  const clampScale = (v) => Math.min(2.2, Math.max(0.35, v));
  const zoomIn = () => setScale((s) => clampScale(s + 0.15));
  const zoomOut = () => setScale((s) => clampScale(s - 0.15));
  const reset = () => { setScale(1); setPos({ x: 0, y: 0 }); };

  const fit = useCallback(() => {
    const wrap = wrapRef.current, content = contentRef.current;
    if (!wrap || !content) return;
    const cw = content.scrollWidth, ch = content.scrollHeight;
    const ww = wrap.clientWidth - 32, wh = wrap.clientHeight - 32;
    if (!cw || !ch) return;
    const s = clampScale(Math.min(ww / cw, wh / ch, 1));
    setScale(s);
    setPos({ x: 0, y: 0 });
  }, []);

  useEffect(() => { fit(); }, [employees.length, scopeEmployeeId, fit]);

  const onWheel = (e) => {
    if (!wrapRef.current?.contains(e.target)) return;
    e.preventDefault();
    setScale((s) => clampScale(s + (e.deltaY < 0 ? 0.08 : -0.08)));
  };

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    const { startX, startY, origX, origY } = dragRef.current;
    setPos({ x: origX + (e.clientX - startX), y: origY + (e.clientY - startY) });
  };
  const stopDrag = () => { dragRef.current = null; };

  const empty = scopeEmployeeId ? !scoped?.self : employees.length === 0;

  return (
    <div className="relative">
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-xl border border-line dark:border-line-dark bg-surface/90 dark:bg-surface-dark/90 backdrop-blur px-1.5 py-1.5 shadow-sm">
        <ZoomBtn icon={ZoomOut} onClick={zoomOut} title="Zoom out" />
        <span className="text-[11px] font-medium text-ink-soft dark:text-ink-soft-dark w-10 text-center select-none">{Math.round(scale * 100)}%</span>
        <ZoomBtn icon={ZoomIn} onClick={zoomIn} title="Zoom in" />
        <div className="w-px h-5 bg-line dark:bg-line-dark mx-0.5" />
        <ZoomBtn icon={Maximize2} onClick={fit} title="Fit to screen" />
        <ZoomBtn icon={LocateFixed} onClick={reset} title="Reset view" />
      </div>

      {empty ? (
        <p className="text-sm text-ink-faint text-center py-16">
          {scopeEmployeeId ? 'Your profile is not yet linked in the organisation chart.' : 'Add your first employee to see the organisation tree.'}
        </p>
      ) : (
        <div
          ref={wrapRef}
          className="org-tree-viewport overflow-hidden rounded-xl bg-[radial-gradient(var(--color-line)_1px,transparent_1px)] dark:bg-[radial-gradient(var(--color-line-dark)_1px,transparent_1px)] [background-size:18px_18px]"
          style={{ height: '60vh', minHeight: 420, cursor: dragRef.current ? 'grabbing' : 'grab' }}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
        >
          <style>{`
            .org-tree ul { padding-top: 28px; position: relative; display: flex; }
            .org-tree li { flex: 1; text-align: center; list-style: none; position: relative; padding: 28px 10px 0 10px; }
            .org-tree li::before, .org-tree li::after {
              content: ''; position: absolute; top: 0; right: 50%; width: 50%; height: 28px;
              border-top: 2px solid var(--color-line);
            }
            .org-tree li::after { right: auto; left: 50%; border-left: 2px solid var(--color-line); }
            .org-tree li:only-child::after, .org-tree li:only-child::before { display: none; }
            .org-tree li:only-child { padding-top: 0; }
            .org-tree li:first-child::before, .org-tree li:last-child::after { border: 0 none; }
            .org-tree li:last-child::before { border-right: 2px solid var(--color-line); border-radius: 0 6px 0 0; }
            .org-tree li:first-child::after { border-radius: 6px 0 0 0; }
            .org-tree ul ul::before {
              content: ''; position: absolute; top: 0; left: 50%; border-left: 2px solid var(--color-line); width: 0; height: 28px;
            }
            .org-tree > ul { padding-top: 0; display: inline-flex; }
            .org-tree > ul > li::before, .org-tree > ul > li::after { display: none !important; }
            .dark .org-tree li::before, .dark .org-tree li::after, .dark .org-tree ul ul::before { border-color: var(--color-line-dark); }
          `}</style>
          <div
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              transformOrigin: 'top left',
              transition: dragRef.current ? 'none' : 'transform 0.12s ease-out',
              padding: 40,
              width: 'max-content',
            }}
          >
            <div ref={contentRef} className="org-tree inline-block">
              {scopeEmployeeId ? (
                <div className="flex flex-col items-center">
                  {scoped?.manager && (
                    <>
                      <NodeCard node={scoped.manager} muted subtitle="Your reporting manager" />
                      <div className="h-7 w-px bg-line dark:bg-line-dark" />
                    </>
                  )}
                  <ul><TreeNode node={scoped?.self} onSelect={onSelect} /></ul>
                </div>
              ) : (
                <ul>{roots.map((r) => <TreeNode key={r.id} node={r} onSelect={onSelect} />)}</ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ZoomBtn({ icon: Icon, onClick, title }) {
  return (
    <button type="button" onClick={onClick} title={title} className="h-7 w-7 rounded-lg flex items-center justify-center text-ink-soft dark:text-ink-soft-dark hover:bg-surface-soft dark:hover:bg-surface-dark-soft transition">
      <Icon size={14} />
    </button>
  );
}

function NodeCard({ node, onSelect, muted, subtitle }) {
  const status = statusMeta(node.status);
  return (
    <button
      onClick={() => onSelect?.(node)}
      disabled={!onSelect}
      className={`inline-flex flex-col items-center gap-0.5 rounded-xl border px-4 py-2.5 min-w-[150px] transition ${
        muted
          ? 'border-dashed border-line dark:border-line-dark bg-surface-soft/60 dark:bg-surface-dark-soft/60 opacity-70'
          : 'border-line dark:border-line-dark bg-surface dark:bg-surface-dark hover:border-brand-purple/40 hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      <span className="relative h-9 w-9 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-semibold mb-1 brand-gradient shrink-0">
        {node.photo ? <img src={node.photo} alt="" className="h-full w-full object-cover" /> : (node.name?.[0]?.toUpperCase() || '?')}
        {!muted && <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-surface dark:ring-surface-dark ${status.dot}`} />}
      </span>
      <span className="text-sm font-medium text-ink dark:text-ink-dark whitespace-nowrap">{node.name}</span>
      <span className="text-xs text-ink-faint whitespace-nowrap">{node.designation || '—'}</span>
      {node.employeeId && <span className="text-[10px] text-ink-faint/80 font-mono whitespace-nowrap">{node.employeeId}</span>}
      {subtitle && <span className="text-[10px] text-ink-faint mt-0.5 whitespace-nowrap">{subtitle}</span>}
    </button>
  );
}

function TreeNode({ node, onSelect }) {
  if (!node) return null;
  return (
    <li>
      <NodeCard node={node} onSelect={onSelect} />
      {node.children?.length > 0 && (
        <ul>
          {node.children.map((c) => <TreeNode key={c.id} node={c} onSelect={onSelect} />)}
        </ul>
      )}
    </li>
  );
}

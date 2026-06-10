'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Article, ArticleFormData, Category, Region, ArticleStatus,
  AddedBy, SVDGRelevanceLevel, SourceQualityLevel, Workstream,
  SponsorNatSec100Relevance,
} from '@/types/article'
import { CATEGORIES, REGIONS, WORKSTREAMS, SUGGESTED_TAGS } from '@/data/categories'
import { SPONSOR_NAMES } from '@/data/sponsors'
import { calcRelevanceScore } from '@/lib/scoring'

interface Props {
  article?: Article
}

const EMPTY_FORM: ArticleFormData = {
  title: '',
  url: '',
  source: '',
  author: '',
  datePublished: new Date().toISOString().split('T')[0],
  categories: [],
  tags: [],
  shortDescription: '',
  whyItMatters: '',
  region: undefined,
  sponsorName: '',
  companyMentions: '',
  status: 'New',
  isFeatured: false,
  svdgRelevanceLevel: 'High',
  sourceQualityLevel: 'High',
  workstreams: [],
  sponsorNatSec100Relevance: 'None',
  addedBy: 'Simone',
  manualScoreOverride: undefined,
}

export default function ArticleForm({ article }: Props) {
  const router = useRouter()
  const isEdit = !!article

  const [form, setForm] = useState<ArticleFormData>(() => {
    if (!article) return EMPTY_FORM
    return {
      title: article.title,
      url: article.url,
      source: article.source,
      author: article.author ?? '',
      datePublished: article.datePublished,
      categories: article.categories,
      tags: article.tags,
      shortDescription: article.shortDescription,
      whyItMatters: article.whyItMatters ?? '',
      region: article.region,
      sponsorName: article.sponsorName ?? '',
      companyMentions: article.companyMentions.join(', '),
      status: article.status,
      isFeatured: article.isFeatured,
      svdgRelevanceLevel: article.svdgRelevanceLevel,
      sourceQualityLevel: article.sourceQualityLevel,
      workstreams: article.workstreams,
      sponsorNatSec100Relevance: article.sponsorNatSec100Relevance,
      addedBy: article.addedBy,
      manualScoreOverride: article.isScoreOverridden ? article.relevanceScore : undefined,
    }
  })

  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  // Calculated score
  const { score: calcScore } = calcRelevanceScore({
    datePublished: form.datePublished,
    svdgRelevanceLevel: form.svdgRelevanceLevel,
    sourceQualityLevel: form.sourceQualityLevel,
    workstreams: form.workstreams,
    sponsorNatSec100Relevance: form.sponsorNatSec100Relevance,
  })

  const finalScore =
    form.manualScoreOverride !== undefined ? form.manualScoreOverride : calcScore

  function set<K extends keyof ArticleFormData>(key: K, val: ArticleFormData[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function toggleCategory(cat: Category) {
    set('categories',
      form.categories.includes(cat)
        ? form.categories.filter((c) => c !== cat)
        : [...form.categories, cat]
    )
  }

  function toggleWorkstream(ws: Workstream) {
    set('workstreams',
      form.workstreams.includes(ws)
        ? form.workstreams.filter((w) => w !== ws)
        : [...form.workstreams, ws]
    )
  }

  function addTag(tag: string) {
    const t = tag.trim()
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t])
    setTagInput('')
  }

  function removeTag(tag: string) {
    set('tags', form.tags.filter((t) => t !== tag))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.url || !form.source || !form.shortDescription || form.categories.length === 0) {
      setError('Please fill in all required fields (title, URL, source, description, at least one category).')
      return
    }
    setLoading(true)
    setError('')
    try {
      const method = isEdit ? 'PUT' : 'POST'
      const url = isEdit ? `/api/articles/${article!.id}` : '/api/articles'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!article) return
    setLoading(true)
    try {
      await fetch(`/api/articles/${article.id}`, { method: 'DELETE' })
      router.push('/')
      router.refresh()
    } catch {
      setError('Delete failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full text-sm border border-white/15 bg-white/5 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-svdg-crayola"
  const labelClass = "block text-xs font-semibold text-svdg-french-gray mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/15 border border-red-400/30 text-red-300 text-sm px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* ── Core fields ───────────────────────────────────────────── */}
      <section className="bg-svdg-surface/95 border border-white/10 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 border-b border-white/10 pb-2">Article</h2>

        <div>
          <label className={labelClass}>Title *</label>
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Article headline"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>URL *</label>
            <input
              className={inputClass}
              type="url"
              value={form.url}
              onChange={(e) => set('url', e.target.value)}
              placeholder="https://..."
              required
            />
          </div>
          <div>
            <label className={labelClass}>Source *</label>
            <input
              className={inputClass}
              value={form.source}
              onChange={(e) => set('source', e.target.value)}
              placeholder="Defense News, DoD.gov, War on the Rocks…"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Author</label>
            <input
              className={inputClass}
              value={form.author}
              onChange={(e) => set('author', e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className={labelClass}>Date Published *</label>
            <input
              className={inputClass}
              type="date"
              value={form.datePublished}
              onChange={(e) => set('datePublished', e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Short Description *</label>
          <textarea
            className={`${inputClass} h-20 resize-y`}
            value={form.shortDescription}
            onChange={(e) => set('shortDescription', e.target.value)}
            placeholder="1–2 sentences summarizing the article"
            required
          />
        </div>

        <div>
          <label className={labelClass}>Why It Matters <span className="font-normal text-svdg-french-gray">(strongly encouraged)</span></label>
          <textarea
            className={`${inputClass} h-20 resize-y`}
            value={form.whyItMatters}
            onChange={(e) => set('whyItMatters', e.target.value)}
            placeholder="Why does this matter to SVDG specifically?"
          />
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────── */}
      <section className="bg-svdg-surface/95 border border-white/10 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-slate-200 border-b border-white/10 pb-2 mb-3">
          Categories * <span className="font-normal text-svdg-french-gray">(select all that apply)</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.label)}
              className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                form.categories.includes(cat.label)
                  ? `${cat.bgColor} ${cat.color} font-semibold`
                  : 'bg-white/5 border-white/10 text-svdg-french-gray hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Tags ──────────────────────────────────────────────────── */}
      <section className="bg-svdg-surface/95 border border-white/10 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-slate-200 border-b border-white/10 pb-2 mb-3">Tags</h2>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded"
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 text-xs border border-white/15 bg-white/5 text-white rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-svdg-crayola"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }}
            placeholder="Type tag and press Enter"
          />
          <button
            type="button"
            onClick={() => addTag(tagInput)}
            className="text-xs bg-white/5 hover:bg-white/10 text-slate-200 px-3 py-1.5 rounded"
          >Add</button>
        </div>
        <div className="flex flex-wrap gap-1">
          {SUGGESTED_TAGS.filter((t) => !form.tags.includes(t)).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="text-[10px] bg-white/5 hover:bg-blue-500/15 hover:text-blue-300 text-svdg-french-gray px-1.5 py-0.5 rounded transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* ── Meta ─────────────────────────────────────────────────── */}
      <section className="bg-svdg-surface/95 border border-white/10 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 border-b border-white/10 pb-2">Metadata</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Region</label>
            <select
              className={inputClass}
              value={form.region ?? ''}
              onChange={(e) => set('region', (e.target.value as Region) || undefined)}
            >
              <option value="">— Select —</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Sponsor Name</label>
            <input
              className={inputClass}
              list="sponsor-options"
              value={form.sponsorName}
              onChange={(e) => set('sponsorName', e.target.value)}
              placeholder="e.g. Booz Allen Hamilton"
            />
            <datalist id="sponsor-options">
              {SPONSOR_NAMES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={labelClass}>Company Mentions</label>
            <input
              className={inputClass}
              value={form.companyMentions}
              onChange={(e) => set('companyMentions', e.target.value)}
              placeholder="Comma-separated"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Status</label>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => set('status', e.target.value as ArticleStatus)}
            >
              {(['New', 'Reviewed', 'Featured', 'Rejected', 'Archived'] as ArticleStatus[]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Added By</label>
            <select
              className={inputClass}
              value={form.addedBy}
              onChange={(e) => set('addedBy', e.target.value as AddedBy)}
            >
              {(['Simone', 'Manual', 'AI Candidate', 'Newsletter', 'Browser Extension', 'Other'] as AddedBy[]).map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-200">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => set('isFeatured', e.target.checked)}
                className="rounded"
              />
              Feature on Home / Rundown
            </label>
          </div>
        </div>
      </section>

      {/* ── Relevance Scoring ─────────────────────────────────────── */}
      <section className="bg-svdg-surface/95 border border-white/10 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 border-b border-white/10 pb-2">Relevance Scoring</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>SVDG Relevance <span className="text-svdg-french-gray">(35 pts)</span></label>
            <select
              className={inputClass}
              value={form.svdgRelevanceLevel}
              onChange={(e) => set('svdgRelevanceLevel', e.target.value as SVDGRelevanceLevel)}
            >
              <option value="High">High (35)</option>
              <option value="Medium">Medium (20)</option>
              <option value="Low">Low (5)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Source Quality <span className="text-svdg-french-gray">(15 pts)</span></label>
            <select
              className={inputClass}
              value={form.sourceQualityLevel}
              onChange={(e) => set('sourceQualityLevel', e.target.value as SourceQualityLevel)}
            >
              <option value="High">High (15)</option>
              <option value="Medium">Medium (8)</option>
              <option value="Low">Low (3)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Sponsor / NatSec100 <span className="text-svdg-french-gray">(10 pts)</span></label>
            <select
              className={inputClass}
              value={form.sponsorNatSec100Relevance}
              onChange={(e) => set('sponsorNatSec100Relevance', e.target.value as SponsorNatSec100Relevance)}
            >
              <option value="Direct">Direct mention (10)</option>
              <option value="Ecosystem">Ecosystem / related (5)</option>
              <option value="None">No relation (0)</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Workstream Relevance <span className="text-svdg-french-gray">(up to 10 pts)</span></label>
          <div className="flex flex-wrap gap-2 mt-1">
            {WORKSTREAMS.map((ws) => (
              <button
                key={ws}
                type="button"
                onClick={() => toggleWorkstream(ws)}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                  form.workstreams.includes(ws)
                    ? 'bg-purple-500/15 border-purple-400/30 text-purple-300 font-medium'
                    : 'bg-white/5 border-white/10 text-svdg-french-gray hover:bg-white/10'
                }`}
              >
                {ws}
              </button>
            ))}
          </div>
        </div>

        {/* Score display */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
          <div>
            <div className="text-xs text-svdg-french-gray mb-0.5">Auto-calculated</div>
            <div className="text-2xl font-bold text-white">{calcScore}</div>
          </div>
          <div className="text-svdg-french-gray text-xl">→</div>
          <div>
            <label className="block text-xs text-svdg-french-gray mb-0.5">
              Manual override <span className="text-svdg-french-gray">(leave blank to use auto)</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-24 text-sm border border-white/15 bg-white/5 text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-svdg-crayola"
              value={form.manualScoreOverride ?? ''}
              onChange={(e) => {
                const v = e.target.value === '' ? undefined : parseInt(e.target.value)
                set('manualScoreOverride', v)
              }}
              placeholder="0–100"
            />
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-svdg-french-gray mb-0.5">Final score</div>
            <div className={`text-2xl font-bold ${finalScore >= 80 ? 'text-emerald-400' : finalScore >= 60 ? 'text-svdg-sky' : 'text-slate-300'}`}>
              {finalScore}
            </div>
          </div>
        </div>
      </section>

      {/* ── Submit ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="svdg-btn svdg-btn--primary disabled:opacity-50"
        >
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Article'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-svdg-french-gray hover:text-slate-200 px-3 py-2"
        >
          Cancel
        </button>
        {isEdit && (
          <div className="ml-auto">
            {!deleteConfirm ? (
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="text-sm text-red-400 hover:text-red-300 px-3 py-2"
              >
                Delete article
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">Sure?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-sm bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  className="text-sm text-svdg-french-gray"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  )
}

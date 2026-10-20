// Each past paper is run exactly as its instructions say, with the unknowns made up as in the
// confidential instructions. The observations must contain what the published mark scheme credits.
import { describe, expect, test } from 'vitest'
import { Lab } from '../lab'
import { PAPERS } from '../../papers'

const EXPECT: Record<string, Record<string, RegExp[]>> = {
  '0620_s24_51': {
    a: [/[Cc]ondensation/, /[Mm]elts/, /green/],
    'b-i': [/[Gg]rey-green precipitate forms/, /dissolves/],
    'b-ii': [/litmus paper turns blue/],
    c: [/[Gg]rey-green precipitate/, /Effervescence/],
    'd-i': [/turns pink/],
    e: [/White precipitate/],
  },
  '0620_w24_52': {
    a: [/Yellow flame/],
    b: [/[Gg]reen precipitate forms/],
    c: [/Effervescence/],
    d: [/Effervescence/, /orange-brown|red-brown/],
    e: [/Cream precipitate/],
    g: [/Effervescence/, /limewater turns milky/],
    h: [/litmus paper turns blue/],
  },
  '0620_s23_51': {
    a: [/[Cc]ondensation|[Ss]team/, /[Mm]elts|liquid/],
    c: [/[Rr]ed-brown precipitate forms/],
    d: [/litmus paper turns blue/],
    e: [/dark purple.*on standing.*(yellow|paler)/],
    f: [/White precipitate/],
    g: [/^No visible change. No visible change.$/],
    h: [/[Rr]ed-brown precipitate/],
    i: [/brown.*starch.*blue-black/],
    j: [/pink/],
  },
  '0620_s24_52': {
    'a-i': [/Effervescence/, /solid dissolves/, /limewater turns milky/],
    b: [/Light green flame/],
    'c-i': [/pink/],
    d: [/White precipitate/],
    e: [/^No visible change. No visible change.$/],
    g: [/red litmus paper turns blue/, /blue litmus paper stays blue/],
    'h-i': [/White precipitate/],
    'h-ii': [/precipitate dissolves, giving a colourless solution/],
    i: [/pH ≈ [3-6]\./],
  },
  '9701_s25_31': {
    'a-i': [
      /Test 1: [Pp]ale blue precipitate forms.*dissolves, giving a deep blue solution/,
      /Test 2: [Pp]ale blue precipitate.*black.*litmus paper turns blue/,
      /Test 3: White precipitate/,
      /Test 4: No visible change/,
      /Test 5: No visible change/,
      /Test 6: .*brown.*starch: .*blue-black/,
    ],
    'b-i': [/[Cc]ondensation/],
    'b-ii': [/Effervescence/, /limewater turns milky/],
  },
  '9701_w24_34': {
    'a-i': [/crackle|jump/, /[Bb]lack/, /glowing splint relights/],
    'a-ii': [/Test 1: .*purple/, /Test 2: .*green solution/],
    'b-i': [
      /Test 1: [Pp]ale blue precipitate forms.*dissolves, giving a deep blue solution.*H₂O₂: .*Effervescence.*[Bb]lack.*relights/,
      /Test 2: [Oo]ff-white precipitate.*brown.*FB 8: .*colourless/,
    ],
    'b-ii': [/White precipitate forms. .*No visible change/],
  },
  '9701_s24_33': {
    'a-i': [/Test 1: .*[Cc]ondensation.*[Pp]urple vapour.*yellow.*cooling.*white/, /Test 2: Effervescence.*limewater turns milky/],
    'a-ii': [
      /Test 1: .*brown.*thiosulfate: .*colourless/,
      /Test 2: .*White precipitate forms.*dissolves/,
      /Test 3: .*White precipitate forms.*dissolves/,
      /Test 4: [Oo]ff-white precipitate.*brown.*thiosulfate: .*(blue|white)/,
      /Test 5: Yellow precipitate/,
    ],
  },
}

describe.each(PAPERS.map((p) => [p.id, p] as const))('%s supervisor run matches the mark scheme', (id, paper) => {
  const lab = new Lab({ samples: paper.samples, reagents: paper.reagents })
  const results = paper.supervisor(lab)
  test.each(Object.entries(EXPECT[id] ?? {}))('part %s', (part, patterns) => {
    for (const re of patterns) expect(results[part], `${id} ${part}`).toMatch(re)
  })
  test('marks add up', () => {
    expect(paper.parts.reduce((s, p) => s + p.marks, 0)).toBe(paper.totalMarks)
  })
})

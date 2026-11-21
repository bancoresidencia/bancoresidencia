import assert from 'node:assert/strict'
import { applyInk, cutInk, insideLasso, projectInk, touchesInk, type InkStroke } from '../src/services/studyInk.ts'

const p = (x: number, y: number) => ({x,y,force:1})
const line: InkStroke = {id:'a', kind:'pen', created:1, points:[p(0,0),p(100,0)], width:2, opacity:1, color:'#123456', pressure:false}
assert.equal(touchesInk(line,p(50,2),2),true)
const fragments = cutInk(line,[p(50,0)],5)
assert.equal(fragments.length,2)
assert.ok(fragments.every(s => s.color === line.color && !touchesInk(s,p(50,0),1)))
assert.deepEqual(applyInk(fragments,{before:fragments,after:[line]}), [line])
assert.deepEqual(applyInk([line],{before:[],after:[line]}), [line])
assert.equal(insideLasso(p(3,3),[p(0,0),p(8,0),p(8,8),p(0,8)]),true)
assert.equal(insideLasso(p(9,3),[p(0,0),p(8,0),p(8,8),p(0,8)]),false)
const anchored = {...line, anchor:{block:'A',box:{x:0,y:0,width:100,height:20}}}
assert.deepEqual(projectInk(anchored,{A:{x:20,y:100,width:200,height:30}}).points, [p(20,100),p(220,100)])
console.log('Caneta: borracha, fragmentos, histórico, laço e geometria aprovados.')

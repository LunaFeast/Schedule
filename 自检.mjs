/* Schedule 自己那一摞自检（插件分离第 5 批：检查跟着代码走）
   ------------------------------------------------------------
     node 自检.mjs        跑 src\tools\probes\ 里 gate- / test- / klog- 起头的那几台
   这一棵里没有主程序那些零件：这几台读的就是本仓那几份源码，路径与从前在主程序仓里逐字一样。
   这一份由主程序那一颗搬仓的（src\_build\pack-repo.mjs 的 --搬自检）生成，改判据请改那一颗再重搬。 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const 仓 = path.dirname(fileURLToPath(import.meta.url));
const 格 = path.join(仓, 'src', 'tools', 'probes');
const 台 = fs.existsSync(格) ? fs.readdirSync(格).filter(f => /^(gate|test|klog)-.*\.mjs$/.test(f)).sort() : [];
if(!台.length){ console.error('schedule 这一棵里一台自检都没有 —— 别把"没有台子"当成"全过了"'); process.exit(1); }
let 跑通 = 0, 抛了 = 0;
for(const 名 of 台){
  const 结 = spawnSync(process.execPath, [path.join(格, 名)], { cwd: 仓, encoding: 'utf8' });
  const 出 = String(结.stdout || '') + String(结.stderr || '');
  const 账 = /：(\d+) 过 (\d+) 不过/.exec(出);
  if(结.status === 0){ 跑通++; console.log('  · ' + 名 + ' 跑通' + (账 ? ' · ' + 账[1] + ' 过 ' + 账[2] + ' 不过' : ' · 这台没报账')); }
  else { 抛了++; console.log('  ! ' + 名 + ' 抛了（退出码 ' + 结.status + '）');
    console.log(出.split(/\r?\n/).filter(l => /FAIL|Error|抛/.test(l)).slice(0, 8).map(l => '      ' + l).join('\n')); }
}
console.log('\nSchedule 自己那一摞：' + 台.length + ' 台 · 跑通 ' + 跑通 + ' · 抛了 ' + 抛了);
process.exitCode = 抛了 ? 1 : 0;

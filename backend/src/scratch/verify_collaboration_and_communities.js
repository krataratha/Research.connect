/**
 * verify_collaboration_and_communities.js
 * Phase 6 & 7 Comprehensive Verification Script
 * Validates database models, API contracts, and socket infrastructure.
 */

const mongoose = require('mongoose');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

// ─── Utility ──────────────────────────────────────────────────────────────────
const results = [];
const ok  = (label) => { results.push({ status: '✅ PASS', label }); };
const fail = (label, err) => { results.push({ status: '❌ FAIL', label, error: err?.message || String(err) }); };

function testRequire(label, modPath) {
  try {
    require(modPath);
    ok(label);
    return true;
  } catch (err) {
    fail(label, err);
    return false;
  }
}

// ─── Phase 6: Collaboration Models ───────────────────────────────────────────
console.log('\n══════════════════════════════════════════════');
console.log('  PHASE 6 — COLLABORATION WORKSPACE MODULES   ');
console.log('══════════════════════════════════════════════\n');

const colPath = `${ROOT}/src/modules/collaborations`;
testRequire('Collaboration model',         `${colPath}/model/Collaboration`);
testRequire('CollaborationMember model',   `${colPath}/model/CollaborationMember`);
testRequire('CollaborationInvitation',     `${colPath}/model/CollaborationInvitation`);
testRequire('CollaborationTask model',     `${colPath}/model/CollaborationTask`);
testRequire('CollaborationFile model',     `${colPath}/model/CollaborationFile`);
testRequire('CollaborationActivity model', `${colPath}/model/CollaborationActivity`);
testRequire('CollaborationMessage model',  `${colPath}/model/CollaborationMessage`);
testRequire('CollaborationMeeting model',  `${colPath}/model/CollaborationMeeting`);
testRequire('Collaboration Repository',    `${colPath}/repository/collaboration.repository`);
testRequire('Collaboration Service',       `${colPath}/service/collaboration.service`);
testRequire('Collaboration Controller',    `${colPath}/controller/collaboration.controller`);
testRequire('Collaboration Routes',        `${colPath}/routes/collaboration.routes`);
testRequire('Collaboration Socket',        `${colPath}/socket/collaboration.socket`);

// ─── Phase 7: Community Models ────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════');
console.log('   PHASE 7 — RESEARCH COMMUNITY MODULES        ');
console.log('══════════════════════════════════════════════\n');

const comPath = `${ROOT}/src/modules/communities`;
testRequire('Community model',             `${comPath}/model/Community`);
testRequire('CommunityMember model',       `${comPath}/model/CommunityMember`);
testRequire('CommunityInvitation model',   `${comPath}/model/CommunityInvitation`);
testRequire('CommunityPost model',         `${comPath}/model/CommunityPost`);
testRequire('CommunityComment model',      `${comPath}/model/CommunityComment`);
testRequire('CommunityDiscussion model',   `${comPath}/model/CommunityDiscussion`);
testRequire('CommunityFile model',         `${comPath}/model/CommunityFile`);
testRequire('CommunityEvent model',        `${comPath}/model/CommunityEvent`);
testRequire('CommunityJob model',          `${comPath}/model/CommunityJob`);
testRequire('CommunityAnnouncement model', `${comPath}/model/CommunityAnnouncement`);
testRequire('CommunityMessage model',      `${comPath}/model/CommunityMessage`);
testRequire('Community Repository',        `${comPath}/repository/community.repository`);
testRequire('Community Service',           `${comPath}/service/community.service`);
testRequire('Community Controller',        `${comPath}/controller/community.controller`);
testRequire('Community Routes',            `${comPath}/routes/community.routes`);
testRequire('Community Socket',            `${comPath}/socket/community.socket`);

// ─── App.js mount check ───────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════');
console.log('   ROUTES REGISTRATION CHECK                   ');
console.log('══════════════════════════════════════════════\n');

const fs = require('fs');
const appContent = fs.readFileSync(`${ROOT}/src/app.js`, 'utf8');

[
  ['/api/v1/collaborations', 'Collaboration routes mounted in app.js'],
  ['/api/v1/communities',    'Community routes mounted in app.js'],
].forEach(([needle, label]) => {
  if (appContent.includes(needle)) ok(label);
  else fail(label, new Error(`"${needle}" not found in app.js`));
});

// Socket gateway check
const gwContent = fs.readFileSync(`${ROOT}/src/socket/gateway/socket.gateway.js`, 'utf8');
[
  ['collaboration.socket', 'Collaboration socket registered in gateway'],
  ['community.socket',     'Community socket registered in gateway'],
].forEach(([needle, label]) => {
  if (gwContent.includes(needle)) ok(label);
  else fail(label, new Error(`"${needle}" not found in socket.gateway.js`));
});

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════');
console.log('   VERIFICATION SUMMARY                        ');
console.log('══════════════════════════════════════════════\n');

const passed = results.filter(r => r.status.startsWith('✅'));
const failed = results.filter(r => r.status.startsWith('❌'));

results.forEach(r => {
  console.log(`  ${r.status}  ${r.label}`);
  if (r.error) console.log(`         Error: ${r.error}`);
});

console.log(`\n  Total: ${results.length}  |  Passed: ${passed.length}  |  Failed: ${failed.length}`);

if (failed.length === 0) {
  console.log('\n  🎉 All Phase 6 & 7 modules verified successfully!');
} else {
  console.log('\n  ⚠️  Some checks failed. Review the errors above.');
  process.exit(1);
}

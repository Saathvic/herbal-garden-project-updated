const fs = require('fs');

const healthIssues = JSON.parse(fs.readFileSync('health-issues-kb.json', 'utf-8'));
const records = [];

for (const issue of healthIssues) {
  for (const remedy of issue.remedies) {
    const id = `${issue.condition.toLowerCase().replace(/\s+/g, '-')}-${remedy.plantName.toLowerCase().replace(/\s+/g, '-')}`;
    records.push({
      _id: id,
      chunk_text: `For the health issue '${issue.condition}', the herb '${remedy.plantName}' is recommended. The preparation is: ${remedy.preparation}`,
      condition: issue.condition,
      plantName: remedy.plantName,
      scientificName: remedy.scientificName,
      preparation: remedy.preparation,
      source: remedy.source
    });
  }
}

console.log(JSON.stringify(records, null, 2));

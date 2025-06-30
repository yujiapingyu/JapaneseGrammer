const path = require("path");
const xlsx = require("xlsx");
const _ = require("lodash");
const { log } = require("console");

function loadGrammerData() {
  const filePath = path.join(__dirname, "resource", "文法汇总N3-N1.xlsx");
  const workbook = xlsx.readFile(filePath);

  const grammarData = [];

  for (let sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const titles = json[0];
    const rows = json.slice(1);

    const items = rows.map(row => {
      const item = {};
      titles.forEach((title, i) => item[title] = row[i]);
      return item;
    });

    for (let i = 0; i < items.length; i++) {
      items[i].group = items[i]["序号"] !== undefined ? items[i]["序号"] : items[i - 1]?.group;
    }

    const grouped = _.groupBy(items, "group");

    grammarData.push(...Object.values(grouped));
  }

  for(let i = 0; i < grammarData.length; i++) {
    const item = grammarData[i];
    for (let j = 0; j < item.length; j++) {
      const ins = item[j];
      if (typeof ins['例句'] === 'string' && ins['例句'].startsWith("B：")) {
        if (item[j-1] && typeof item[j-1]['例句'] === 'string') {
          item[j-1]['例句'] += `\n${ins['例句']}`;
        }
      }
    }
    // 移出item中以”B：“开头的例句
    grammarData[i] = item.filter(ins => !(typeof ins['例句'] === 'string' && ins['例句'].startsWith("B：")));
  }


  return grammarData;
}

// 注册为全局函数，在 index.html 中可以通过 window.getGrammarData 调用
window.getGrammarData = () => loadGrammerData();

// log("加载语法数据...");
// const grammarData = loadGrammerData();
// log(`已加载语法数据，共 ${grammarData.length} 条`);

// log(grammarData[62]);
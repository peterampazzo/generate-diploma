"use strict";

const fs = require("fs");
const path = require('path');
const HummusRecipe = require("hummus-recipe");
const argv = require("minimist")(process.argv.slice(2));
const readline = require("readline");

const options = {
  names_dir: "names/",
  template_dir: "templates/",
  output_dir: "output/",
  fonts_dir: path.join(__dirname, 'fonts'),
  text: {
    x: 417.6,
    y: 310,
    size: 60,
    color: "000000",
    font: "Bradley_Hand_ITC_TT_Bold"
  }
};

function getNames(list) {
  return new Promise(x => {
    setTimeout(() => {
      let rl = readline.createInterface({
        input: fs.createReadStream(options.names_dir + list + ".txt")
      });
      let names = [];
      let line_no = 0;

      // event is emitted after each line
      rl.on("line", function (line) {
        line_no++;
        names.push(
          line
            .toLowerCase()
            .split(" ")
            .map(s => s.charAt(0).toUpperCase() + s.substring(1))
            .join(" ")
        );
      });
      rl.on("close", function (line) {
        x(names);
      });
    }, 2000);
  });
}

async function makeNames(list) {
  console.log("Lista scelta: " + list);
  var result = await getNames(list);
  const size = result.length;
  console.log("Numero totale di nomi: " + size);
  let count = 1;
  result.forEach(element => {
    let pdfDoc = new HummusRecipe(
      options.template_dir + list + ".pdf",
      options.output_dir + list + "/" + element + ".pdf", {
      fontSrcPath: options.fonts_dir // for example, there is a font './fonts/msyh.ttf'
    });
    pdfDoc
      // edit 1st page
      .editPage(1)
      .text(element, options.text.x, options.text.y, {
        font: options.text.font,
        color: options.text.color,
        fontSize: options.text.size,
        // bold: true,
        align: "center center"
      })
      .endPage()
      // end and save
      .endPDF();
    console.log(count + "/" + size + " - " + element);
    count++;
  });
}

if (!argv["l"]) {
  console.log(
    "\nNon hai specificiato la lista\ndevi usare il parametro -l\n\nEsempio: node app.js -l example"
  );
  process.exit();
} else {
  let group = argv["l"];
  if (!fs.existsSync(options.output_dir)) {
    fs.mkdirSync(options.output_dir);
  }
  if (!fs.existsSync(options.output_dir + group)) {
    fs.mkdirSync(options.output_dir + group);
  }
  makeNames(group);
}

// font: Brandley Hand
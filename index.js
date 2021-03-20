const Koa = require('koa');
const puppeteer = require('puppeteer');
const app = new Koa();

const evaluate = async options => {
  const {
    url,
    selector,
    selectorOuterHTML = true,
    waitSelector,
    beforeEvaluate,
    afterEvaluate,
    debug = false,
    modulePath = process.env.PUPPETEER_MODULE_PATH
  } = options;
  const start = Date.now();
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  if (beforeEvaluate) {
    await beforeEvaluate(browser, page);
  }
  await page.goto(url);

  // must exist element node
  if (waitSelector) {
    // https://github.com/istanbuljs/nyc/issues/514
    /* istanbul ignore next */
    // eslint-disable-next-line arrow-parens
    await page.waitFor((id) => {
      /* istanbul ignore next */
      const app = document.querySelector(id);
      return app && app.childNodes.length > 0;
    }, [], waitSelector);
  }

  let html;
  if (selector) {
    if (selectorOuterHTML) {
      html = await page.$eval(selector, e => e.outerHTML);
    } else {
      html = await page.$eval(selector, e => e.innerHTML);
    }
  } else {
    html = await page.content();
  }

  if (afterEvaluate) {
    html = await afterEvaluate(browser, page, html);
  }
  await browser.close();
  if (debug) {
    console.debug(`\r\n puppeteer cost: ${Date.now() - start}ms`);
    console.debug(`\r\n puppeteer html: \r\n ${html}`);
  }
  return html;
};

app.use(async (ctx, next) => {
  await next();
  const html = await evaluate({
    url: 'https://baidu.com',
    selector: '#form',
    waitSelector: '#form',
    afterEvaluate: async (browser, page, html) => {
      return html;
    }
  });
  ctx.body = {
    success: 'true',
    html
  };
});

app.listen(3000, () => {
  console.log('server run on http://127.0.0.1:3000');
});
export default async (req) => {
  try {
    const r = await fetch('https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo=350133&provinceId=0&pageSize=500&isVerify=1&pageNo=1', {
      headers: {
        'Referer': 'https://www.sporttery.cn/',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'application/json, text/plain, */A',
        'Accept-Language': 'zh-CN,zh;q=0.9'
      }
    });
    const data = await r.text();
    return new Response(data, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch(e) {
    return new Response(JSON.stringify({error: e.message}), {
      status: 500,
      headers: {'Content-Type': 'application/json'}
    });
  }
};

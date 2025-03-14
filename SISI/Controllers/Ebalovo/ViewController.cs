﻿using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Lampac.Engine.CORE;
using Shared.Engine.SISI;
using Shared.Engine.CORE;
using SISI;
using Lampac.Models.SISI;

namespace Lampac.Controllers.Ebalovo
{
    public class ViewController : BaseSisiController
    {
        [HttpGet]
        [Route("elo/vidosik")]
        async public Task<ActionResult> Index(string uri, bool related)
        {
            var init = loadKit(AppInit.conf.Ebalovo.Clone());
            if (IsBadInitialization(init, out ActionResult action))
                return action;

            var proxyManager = new ProxyManager(init);
            var proxy = proxyManager.Get();

            string memKey = $"ebalovo:view:{uri}";
            if (!hybridCache.TryGetValue(memKey, out StreamItem stream_links))
            {
                stream_links = await EbalovoTo.StreamLinks($"{host}/elo/vidosik", init.corsHost(), uri,
                               url => HttpClient.Get(init.cors(url), timeoutSeconds: 8, proxy: proxy, headers: httpHeaders(init)),
                               location => HttpClient.GetLocation(init.cors(location), timeoutSeconds: 8, proxy: proxy, referer: $"{init.host}/", headers: httpHeaders(init)));

                if (stream_links?.qualitys == null || stream_links.qualitys.Count == 0)
                    return OnError("stream_links", proxyManager);

                proxyManager.Success();
                hybridCache.Set(memKey, stream_links, cacheTime(20, init: init));
            }

            if (related)
                return OnResult(stream_links?.recomends, null, plugin: "elo", total_pages: 1);

            return OnResult(stream_links, init, proxy);
        }
    }
}

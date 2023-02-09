﻿using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Lampac.Engine;
using Lampac.Engine.CORE;
using System;
using Newtonsoft.Json;

namespace Lampac.Controllers.LITE
{
    /// <summary>
    /// https://docs.freekassa.ru/
    /// </summary>
    public class FreeKassa : BaseController
    {
        [HttpGet]
        [Route("freekassa/new")]
        async public Task<ActionResult> Index(string email)
        {
            if (!AppInit.conf.Merchant.FreeKassa.enable || string.IsNullOrWhiteSpace(email))
                return Content(string.Empty);

            string transid = DateTime.Now.ToBinary().ToString().Replace("-", "");

            await System.IO.File.WriteAllTextAsync($"merchant/invoice/freekassa/{transid}", email);

            string hash = CrypTo.md5($"{AppInit.conf.Merchant.FreeKassa.shop_id}:{AppInit.conf.Merchant.accessCost}:{AppInit.conf.Merchant.FreeKassa.secret}:USD:{transid}");
            return Redirect("https://pay.freekassa.ru/" + $"?m={AppInit.conf.Merchant.FreeKassa.shop_id}&oa={AppInit.conf.Merchant.accessCost}&o={transid}&s={hash}&currency=USD");
        }


        [HttpPost]
        [Route("freekassa/callback")]
        async public Task<ActionResult> Callback(string AMOUNT, long MERCHANT_ORDER_ID, string SIGN)
        {
            if (!AppInit.conf.Merchant.FreeKassa.enable || !System.IO.File.Exists($"merchant/invoice/freekassa/{MERCHANT_ORDER_ID}"))
                return StatusCode(403);

            await System.IO.File.AppendAllTextAsync("merchant/log/freekassa.txt", JsonConvert.SerializeObject(HttpContext.Request.Form) + "\n\n\n");

            if (CrypTo.md5($"{AppInit.conf.Merchant.FreeKassa.shop_id}:{AMOUNT}:{AppInit.conf.Merchant.FreeKassa.secret}:{MERCHANT_ORDER_ID}") == SIGN)
            {
                string email = await System.IO.File.ReadAllTextAsync($"merchant/invoice/freekassa/{MERCHANT_ORDER_ID}");
                await System.IO.File.AppendAllTextAsync("merchant/users.txt", $"{email.ToLower()},{DateTime.UtcNow.AddYears(1).ToFileTimeUtc()},freekassa\n");

                if (!AppInit.conf.accsdb.accounts.Contains(email.ToLower()))
                    AppInit.cacheconf.Item2 = default;

                return Content("YES");
            }

            return Content("SIGN != hash");
        }
    }
}

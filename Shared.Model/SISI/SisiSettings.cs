﻿using Shared.Model.Base;

namespace Lampac.Models.SISI
{
    public class SisiSettings : BaseSettings
    {
        public SisiSettings(string plugin, string host, bool enable = true, bool useproxy = false, bool streamproxy = false)
        {
            this.enable = enable;
            this.plugin = plugin;
            this.useproxy = useproxy;
            this.streamproxy = streamproxy;

            if (host != null)
                this.host = host.StartsWith("http") ? host : Decrypt(host);
        }

        public string? cookie { get; set; }

        public SisiSettings Clone()
        {
            return (SisiSettings)MemberwiseClone();
        }
    }
}

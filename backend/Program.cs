using System.Runtime.InteropServices;

var builder = WebApplication.CreateBuilder(args);

// Add CORS to allow Next.js local frontend requests
builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseCors();

// Define endpoint
app.MapGet("/api/simulate", (int rps, int servers, bool cache, bool queue) => {
    var metrics = NativeThermalInterop.CalculateESG(rps, servers, cache, queue);

    return Results.Ok(new {
        Rps = rps,
        Servers = servers,
        CacheActive = cache,
        QueueActive = queue,
        PUE = Math.Round(metrics.Pue, 3),
        WUE = Math.Round(metrics.WueLitersPerKwh, 3),
        FacilityPowerKW = Math.Round(metrics.FacilityPowerKw, 2),
        Status = metrics.Pue < 1.25 ? "ESG Compliant" : "High Energy Draw"
    });
});

app.Run();

// P/Invoke binding to C++ library
public static class NativeThermalInterop
{
    [StructLayout(LayoutKind.Sequential)]
    public struct DynamicMetrics
    {
        public double Pue;
        public double WueLitersPerKwh;
        public double FacilityPowerKw;
    }

    [DllImport("thermal_engine.dll", CallingConvention = CallingConvention.Cdecl)]
    public static extern DynamicMetrics CalculateESG(int rps, int activeServers, bool cacheEnabled, bool queueEnabled);
}
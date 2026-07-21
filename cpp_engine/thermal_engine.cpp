#include <algorithm>

extern "C" {
    struct DynamicMetrics {
        double pue;
        double wue_liters_per_kwh;
        double facility_power_kw;
    };

    #ifdef _WIN32
    __declspec(dllexport)
    #endif
    DynamicMetrics CalculateESG(int rps, int active_servers, bool cache_enabled, bool queue_enabled) {
        DynamicMetrics result;

        // Calculate load percentage per server
        double load_ratio = (double)rps / (active_servers * 300.0);
        if (load_ratio > 1.0) load_ratio = 1.0;

        // Software optimizations reduce active CPU thermal load
        if (cache_enabled) load_ratio *= 0.6;
        if (queue_enabled) load_ratio *= 0.8;

        // IT Power calculation
        double total_it_power_kw = (active_servers * (200.0 + (load_ratio * 250.0))) / 1000.0;

        // Cooling overhead scales with load
        double cooling_overhead_kw = total_it_power_kw * (0.15 + (load_ratio * 0.25));
        double total_facility_power_kw = total_it_power_kw + cooling_overhead_kw;

        // ESG Equations: PUE and WUE
        result.pue = total_facility_power_kw / total_it_power_kw;
        result.wue_liters_per_kwh = 1.8 * (result.pue - 1.0);
        result.facility_power_kw = total_facility_power_kw;

        return result;
    }
}
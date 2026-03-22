"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookies = setAuthCookies;
exports.clearAuthCookies = clearAuthCookies;
function toMs(v, fallbackMs) {
    if (typeof v === 'number')
        return v * 1000;
    const s = (v ?? '').toString().trim();
    if (!s)
        return fallbackMs;
    const m = /^(\d+)\s*(ms|s|m|h|d)?$/i.exec(s);
    if (!m)
        return fallbackMs;
    const n = parseInt(m[1], 10);
    const u = (m[2] || 's').toLowerCase();
    const mult = u === 'ms' ? 1 : u === 's' ? 1000 : u === 'm' ? 60000 : u === 'h' ? 3600000 : 86400000;
    return n * mult;
}
function setAuthCookies(res, cfg, tokens) {
    const nodeEnv = (cfg.get('NODE_ENV') || process.env.NODE_ENV || 'development').toLowerCase();
    const secure = (cfg.get('COOKIE_SECURE') ?? (nodeEnv === 'production' ? 'true' : 'false')) === 'true';
    const sameSite = (cfg.get('COOKIE_SAMESITE') || 'lax').toLowerCase();
    const domain = (cfg.get('COOKIE_DOMAIN') || '').trim() || undefined;
    const base = {
        httpOnly: true,
        secure: sameSite === 'none' ? true : secure,
        sameSite: sameSite,
        path: '/',
        ...(domain ? { domain } : {}),
    };
    res.cookie('accessToken', tokens.accessToken, {
        ...base,
        maxAge: toMs(cfg.get('JWT_ACCESS_EXPIRES'), 15 * 60 * 1000),
    });
    res.cookie('refreshToken', tokens.refreshToken, {
        ...base,
        maxAge: toMs(cfg.get('JWT_REFRESH_EXPIRES'), 7 * 24 * 60 * 60 * 1000),
    });
}
function clearAuthCookies(res, cfg) {
    const nodeEnv = (cfg.get('NODE_ENV') || process.env.NODE_ENV || 'development').toLowerCase();
    const secure = (cfg.get('COOKIE_SECURE') ?? (nodeEnv === 'production' ? 'true' : 'false')) === 'true';
    const sameSite = (cfg.get('COOKIE_SAMESITE') || 'lax').toLowerCase();
    const domain = (cfg.get('COOKIE_DOMAIN') || '').trim() || undefined;
    const base = {
        httpOnly: true,
        secure: sameSite === 'none' ? true : secure,
        sameSite: sameSite,
        path: '/',
        ...(domain ? { domain } : {}),
        maxAge: 0,
    };
    res.cookie('accessToken', '', base);
    res.cookie('refreshToken', '', base);
}
//# sourceMappingURL=cookie.util.js.map
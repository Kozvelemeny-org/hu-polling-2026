import { PUBLIC_STATIC_BASE_URL } from '$env/static/public';

export const staticBase = (PUBLIC_STATIC_BASE_URL ?? '').replace(/\/$/, '');

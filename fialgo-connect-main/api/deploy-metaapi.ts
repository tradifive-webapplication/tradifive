import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local' });

function sendJson(res: VercelResponse | any, status: number, data: any) {
  if (typeof res.status === 'function') {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(data));
}

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed. Only POST is supported.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return sendJson(res, 400, { error: 'Invalid JSON body' });
      }
    }

    const { accountNumber, masterPassword, brokerServer, userId } = body || {};

    if (!accountNumber || !masterPassword || !brokerServer) {
      return sendJson(res, 400, {
        error: 'Missing required credentials. Please provide accountNumber, masterPassword, and brokerServer.',
      });
    }

    const metaApiToken =
      process.env.META_API_TOKEN ||
      'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI3MGEzZmU4ZGUxODk1NTQ1MDI0MTljODMwOWI1NzUzYyIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVzdC1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcnBjLWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6d3M6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVhbC10aW1lLXN0cmVhbWluZy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJtZXRhc3RhdHMtYXBpIiwibWV0aG9kcyI6WyJtZXRhc3RhdHMtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6InJpc2stbWFuYWdlbWVudC1hcGkiLCJtZXRob2RzIjpbInJpc2stbWFuYWdlbWVudC1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoiY29weWZhY3RvcnktYXBpIiwibWV0aG9kcyI6WyJjb3B5ZmFjdG9yeS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibXQtbWFuYWdlci1hcGkiLCJtZXRob2RzIjpbIm10LW1hbmFnZXItYXBpOnJlc3Q6ZGVhbGluZzoqOioiLCJtdC1tYW5hZ2VyLWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJiaWxsaW5nLWFwaSIsIm1ldGhvZHMiOlsiYmlsbGluZy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfV0sImlnbm9yZVJhdGVMaW1pdHMiOmZhbHNlLCJ0b2tlbklkIjoiMjAyMTAyMTMiLCJpbXBlcnNvbmF0ZWQiOmZhbHNlLCJyZWFsVXNlcklkIjoiNzBhM2ZlOGRlMTg5NTU0NTAyNDE5YzgzMDliNTc1M2MiLCJpYXQiOjE3OTUyOTExOTJ9.XCQi6JEAUJmycmfel41RGdHGrANHnH_bgLWKVtuFxP6QSFbsKhA39frxBx_9pLh8sqFYKEKV7JLwMyOkLDewXeoCqHOTgLpXWYCSUFiIJk41FxOhE9XbNS-LksOAH_rxwHnGocKgls2fJu0bTpvYpcmFmG2XU1qD5qbDKpzlCaMFNanHe1MyCSykm_BV7oJbzEzjKDF7BIHQHg07zQi8oFTk5bbgooJsUZqeqLc-eMtpbrE2NbpiwrYYsm7sFg1BI4pG3M00p7vVHrgRyanX0fA0uqWg4xm41p74wjyb5k98X5N3mON6q_IdFrOSK9geKyLKsark32gAgeORC1r0ZO1Ej4JVQ4cX5XDYwuEIVghm4ypq7LiJVEBuccXej9p4m1zG10_a5yuyKVr75EB28Bpr4qPcEY6Wiuu4QmveXUV6kI_xxGN7cV179Tn7cVpG2E55VObSq0llHZQ3TtTClTatwp8lYGlJDaIexQuVzeCvxaukWZyL1gQOrYm0ZfuhPIwOOxpIVk3rTqZJxE3KNxQKvRXzqFwE_TyCo6-kwcJBjsTbjIiXPfyVHHT-opiAiaAFWEpD-wd4V2X6yKVlGZbOCgyeFHSaLhh8c_LkWI172cPGUgPcAYbbE3fh2WdCbBlIqOFsLrH9t-Hf5etiVIGr46m6O6GKgLP9jOgyXrU';

    const metaApiUrl = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts';

    // 1. Check if account already exists in MetaAPI
    let metaapiAccountId: string | null = null;
    try {
      const listRes = await fetch(metaApiUrl, {
        headers: { 'auth-token': metaApiToken },
      });
      if (listRes.ok) {
        const accounts = await listRes.json();
        const existing = accounts.find(
          (a: any) => String(a.login) === String(accountNumber) && a.server === brokerServer
        );
        if (existing) {
          metaapiAccountId = String(existing._id || existing.id);
        }
      }
    } catch (e) {
      console.warn('Could not list MetaAPI accounts:', e);
    }

    // 2. Register account if not existing
    if (!metaapiAccountId) {
      const regPayload = {
        name: `Tradifive-${accountNumber}`,
        type: 'cloud-g1',
        login: String(accountNumber),
        password: masterPassword,
        server: brokerServer,
        platform: 'mt5',
        magic: 1000,
        reliability: 'regular',
      };

      const regRes = await fetch(metaApiUrl, {
        method: 'POST',
        headers: {
          'auth-token': metaApiToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(regPayload),
      });

      const regData = await regRes.json();

      if (!regRes.ok) {
        if (regData.message?.includes('already exists') || JSON.stringify(regData).includes('already exists')) {
          // Fetch existing
          const listRes = await fetch(metaApiUrl, { headers: { 'auth-token': metaApiToken } });
          const accounts = await listRes.json();
          const existing = accounts.find((a: any) => String(a.login) === String(accountNumber));
          if (existing) {
            metaapiAccountId = String(existing._id || existing.id);
          } else {
            return sendJson(res, 400, { error: 'Account already exists in MetaAPI but could not be retrieved.' });
          }
        } else {
          return sendJson(res, 400, {
            error: regData.message || 'MetaAPI registration failed. Please verify login and server.',
          });
        }
      } else {
        metaapiAccountId = String(regData.id || regData._id || regData.accountId);
      }
    }

    // 3. Trigger account deployment if not already deployed
    let deploymentStatus = 'deployed';
    let warningMsg = '';

    if (metaapiAccountId) {
      try {
        const deployRes = await fetch(`${metaApiUrl}/${metaapiAccountId}/deploy`, {
          method: 'POST',
          headers: { 'auth-token': metaApiToken },
        });

        if (!deployRes.ok) {
          const deployErr = await deployRes.json().catch(() => ({}));
          console.warn('MetaAPI deploy response:', deployRes.status, deployErr);
          if (deployErr.message?.includes('top up') || deployRes.status === 403) {
            warningMsg = 'Account registered in MetaAPI, but deployment is paused: please top up your MetaAPI account balance ($0 or negative balance) to allow live streaming.';
            deploymentStatus = 'pending_topup';
          }
        }
      } catch (deployEx) {
        console.warn('Deploy call exception:', deployEx);
      }
    }

    // 4. Save to Supabase mt5_accounts
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hcgylvdvlandtiuudefu.supabase.co';
    const supabaseKey =
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_8x-bgvCQJNkpA5z-PohZFg_WvRMAz7A';

    if (userId) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/mt5_accounts`, {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates',
          },
          body: JSON.stringify({
            user_id: userId,
            account_number: String(accountNumber),
            broker_server: brokerServer,
            metaapi_account_id: metaapiAccountId,
            connection_status: deploymentStatus,
            is_active: true,
            updated_at: new Date().toISOString(),
          }),
        });
      } catch (dbErr) {
        console.warn('Could not save to Supabase mt5_accounts:', dbErr);
      }
    }

    return sendJson(res, 200, {
      success: true,
      message: warningMsg || 'Account successfully registered and deployed with MetaAPI.',
      accountId: metaapiAccountId,
      warning: warningMsg || undefined,
    });
  } catch (err: any) {
    console.error('MetaAPI handler error:', err);
    return sendJson(res, 500, {
      error: err?.message || 'Internal server error during MT5 account connection.',
    });
  }
}

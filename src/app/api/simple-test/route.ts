import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test 1: Basic response
    const basicTest = { test: 'basic', status: 'ok' };
    
    // Test 2: Check environment
    const envTest = {
      hasDB: typeof process !== 'undefined' && process.env && 'DB' in process.env,
      // @ts-expect-error
      globalThis: 'DB' in globalThis,
      // @ts-expect-error
      env: typeof env !== 'undefined'
    };
    
    // Test 3: Try to access DB different ways
    let dbAccess = null;
    let dbError = null;
    
    try {
      // Method 1: Direct from request context
      // @ts-expect-error
      if (request.ctx && request.ctx.env && request.ctx.env.DB) {
        dbAccess = 'request.ctx.env.DB';
      }
      // Method 2: From global env
      // @ts-expect-error
      else if (typeof env !== 'undefined' && env.DB) {
        dbAccess = 'global env.DB';
      }
      // Method 3: From process.env
      // @ts-expect-error
      else if (process.env.DB) {
        dbAccess = 'process.env.DB';
      }
    } catch (e) {
      dbError = e instanceof Error ? e.message : 'Unknown error';
    }
    
    return NextResponse.json({
      success: true,
      tests: {
        basic: basicTest,
        environment: envTest,
        dbAccess,
        dbError
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
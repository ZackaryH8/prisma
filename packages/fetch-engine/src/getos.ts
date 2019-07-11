import os from 'os'
import { exec } from 'child_process'

export type GetOSResult = {
  platform: NodeJS.Platform
  libssl?: string
}

export async function getos(): Promise<GetOSResult> {
  const platform = os.platform()
  if (platform !== 'linux') {
    return {
      platform,
    }
  }

  return {
    platform: 'linux',
    libssl: await getLibSslVersion(),
  }
}

export async function getLibSslVersion(): Promise<string | undefined> {
  const [version, ls] = await Promise.all([
    gracefulExec(`openssl version -v`),
    gracefulExec(`ls -l /lib64 | grep ssl;
    ls -l /usr/lib64 | grep ssl`),
  ])

  if (version) {
    const match = /^OpenSSL\s(\d+\.\d+\.\d+)/.exec(version)
    if (match) {
      return match[1]
    }
  }

  if (ls) {
    const match = /libssl\.so\.(\d+\.\d+\.\d+)/.exec(ls)
    if (match) {
      return match[1]
    }
  }

  return undefined
}

async function gracefulExec(cmd: string): Promise<string | undefined> {
  try {
    const result = await exec(cmd)
    return String(result)
  } catch (e) {
    return undefined
  }
}

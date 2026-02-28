import nextConfig from 'eslint-config-next'

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      // Next.js 기본 규칙 유지, 필요 시 커스텀 규칙 추가
    },
  },
]

export default eslintConfig

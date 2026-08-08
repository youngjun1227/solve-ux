import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 같은 네트워크의 팀원이 http://<이 컴퓨터 IP>:5173 로 접속
    port: 5173,
    strictPort: true, // 포트가 바뀌면 팀원에게 알려준 주소가 깨지므로 고정
    fs: {
      // 카드 md와 캡처 이미지가 저장소 루트에 있으므로 상위 폴더 접근 허용
      allow: [path.resolve(import.meta.dirname, '..')],
    },
  },
})

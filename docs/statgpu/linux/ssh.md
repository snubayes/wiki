---
tags:
  - programming
  - ssh
  - manual
---

# 서버 접속: SSH

일반적으로 리눅스 서버에 접속할 때는 SSH를 이용한다. SSH는 Secure SHell의 약자로, 원격 시스템에서 안전하게 명령을 실행시키기 위한 프로그램 혹은 통신 프로토콜을 뜻한다. 만일 서버에 접속 할 수 있는 계정을 가지고 있고 네트워크로 잘 연결된 상태라면, 언제든 SSH를 이용하여 서버에 접속하여 작업을 할 수 있다.

SSH는 서버 접속 뿐만 아니라 다양한 기능들을 가지고 있는데, 자세한 내용은 뒤에 리눅스 관련 팁들을 서술할 때 마저 다루기로 한다.

윈도우에서는 [PuTTy]를 이용하여 접속할 수 있으며, 맥이나 리눅스에서는 터미널의 `ssh` 명령어를 이용하여 다음과 같이 접속이 가능하다:

```bash
# 참고: 특별한 말이 없다면 `#` 뒤에 나오는 내용들은 주석(comment)이다.

# 사용법: ssh -p [PORT] [USER]@[SERVER]

# 클라이언트에서 입력하는 명령어. 앞에 `~ `는 제외하고 입력.
~ ssh -p 2222 alice@server.address.com
alice@server.address.com password:
# 서버에서 입력하는 명령어. 앞에 `$ `는 제외하고 입력. 명령의 결과는 터미널로 출력된다.
$ whoami
alice
```

성공적으로 접속이 되었다면 터미널 창이 뜰 것이다. 이 터미널에 입력되는 모든 명령들은 서버의 쉘로 전송되어 실행된다.

[PuTTy]: https://www.chiark.greenend.org.uk/~sgtatham/putty/

---
tags:
  - programming
  - git
  - manual
---

# 버전 관리: Git[^git-ref]

## 1 개요

[^git-ref]: 이 장의 많은 내용들은 Scott Chacon and Ben Straub의 [Pro Git]을
    참조하여 작성되었다.

버전 관리 시스템(VCS; Version Control System)은 파일의 여러 버전을 손쉽게
관리하기 위한 프로그램이다. 많은 경우, 프로젝트를 진행하면서 새로운 버전을 만들
때마다 새 폴더나 파일을 복사한 뒤 이를 수정하는 방식을 사용하는데, 파일을
편집할 때마다 매번 복사하는 일은 번거롭기도 하고 또 파일의 어떤 부분이 변경된
것인지 파악하기도 힘들다. 더군다나 여러 명이 협업하는 경우에는 실수로 다른
사람이 수정한 부분을 덮어씌우거나 하는 등 실수할 가능성도 크다. VCS를 이용하여
버전을 기록한다면 각 파일을 이전 상태로 되돌릴 수 있고, 프로젝트를 통째로 이전
상태로 되돌릴 수 있고, 시간에 따라 수정 내용을 비교해 볼 수 있고, 누가 문제를
일으켰는지도 추적할 수 있고, 누가 언제 만들어낸 이슈인지도 알 수 있다. VCS를
사용하면 파일을 잃어버리거나 잘못 고쳤을 때도 쉽게 복구할 수 있다. 이런 모든
장점을 큰 노력 없이 이용할 수 있다.

[Git]은 VCS 중 하나로, 현재 소프트웨어 개발에서 사실상 표준으로 사용되는
VCS이다. 소프르웨어 개발 뿐만 아니라 TeX으로 된 페이퍼를 작성하는 경우 같이
텍스트 파일로 된 프로젝트의 경우 쉽게 Git을 적용할 수 있다[^git-1]. Git은 CLI
도구로서 터미널에서 사용하지만, Git을 사용하기 위한 여러 GUI도 개발되어
있다. 본 매뉴얼에서는 CLI 환경에서 사용법만 다루기로 한다. 매뉴얼에는 기초적인
Git 사용법들만 간략히 서술하였으며, 자세한 내용은 [Pro Git] 같은 다양한
레퍼런스들을 참조하라.

[^git-1]: 본 매뉴얼도 Git으로 관리되고 있다.

본격적으로 Git을 사용하기 전에, 먼저 Git을 설치한 다음에 사용자 이름과 이메일을
다음과 같은 명령어를 이용하여 설정하여야 한다:

```bash
$ git config --global user.name "Alice"
$ git config --global user.email "alice@mail.com"
```

## 2 저장소

저장소(Repository)는 말 그대로 Git이 파일이나 폴더를 저장하는 곳으로, 보통은
작업 디렉토리(Working directory) 안에 `.git` 폴더 형태로 존재한다. 대부분의
경우 사용자는 `.git` 폴더를 신경쓸 필요 없이 작업 디렉토리에서 작업을 하다가
중간중간 Git 명령어들을 이용해 Git 프로그램이 자동적으로 `.git` 폴더를 관리하는
형식으로 작업이 진행되게 된다.

저장소는 다음의 두 방법으로 만들 수 있다. 먼저 작업이 저장되어 있는 다른
저장소를 가져오는 방법이 있는데, 원격 서버의 저장소를 복제하려면 `git clone`을
실행한다:
```bash
$ cd /tmp
# GitHub에 저장된 저장소 simplegit-progit을 로컬의 cloned 폴더로 복제한다.
$ git clone https://github.com/schacon/simplegit-progit cloned
Cloning into 'cloned'...
remote: Counting objects: 13, done.
remote: Total 13 (delta 0), reused 0 (delta 0), pack-reused 13
Unpacking objects: 100% (13/13), done.
$ ls cloned
lib  Rakefile  README
```

새로운 저장소를 만들기 위해서는 저장소로 만들고자 하는 폴더 안에서 `git init`을
실행하면 새 저장소가 생성된다:
```bash
$ cd /tmp
$ mkdir repo
$ cd repo
$ echo "# Git Tutorial" > README.md
$ ls
README.md
# git status: 현재 Git 저장소의 상태를 표시하는 명령어. 아직 저장소를 만들지 않아 에러가 발생한다
$ git status
fatal: not a git repository (or any parent up to mount point /)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
$ git init
Initialized empty Git repository in /tmp/repo/.git/
$ git status
On branch master

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)

    README.md

nothing added to commit but untracked files present (use "git add" to track)
```

위 예의 메세지를 보면 알겠지만 기존에 있던 파일들이 Untracked 상태임을 알 수
있다. 요컨대, `git init` 명령만으로는 Git이 아직 프로젝트의 어떤 파일도
관리하지 않으며, Git이 파일을 track하게 하려면 추가로 명령을 실행하여야
한다. 그 전에, Git이 어떤 식으로 파일을 관리하는지 간단히 알아볼 필요가 있다.

## 3 추가와 커밋

Git으로 하는 일은 기본적으로 아래와 같다:

1. 평소처럼 작업 디렉토리에서 파일을 수정한다.
2. Git이 추적하고자 하는 변경 사항들을 `git add` 명령을 이용해 Staging
   Area에 기록한다.
3. `git commit` 명령을 이용해 Stage된 변경 사항들을 (별도의 메세지와 함께)
   저장소에 영구적으로 기록한다.

![작업 디렉토리, Staging Area, 저장소](img/git-stages.png)

실제로 Git을 쓰면서 우리가 편집할 모든 파일들은 전부 작업 디렉토리에 속하므로,
이에 대해 자세히 알아보자. 작업 디렉토리의 모든 파일은 크게 Tracked와
Untracked로 나뉜다. Untracked 파일은
작업 디렉토리에 있는 파일 중 저장소에도 Staging Area에도 포함되지 않은
파일이다. Untracked 파일들은 Git이 전혀 추적하지 않기 때문에 (추적하라고 따로
명령어를 주기 전까지는) 무슨 짓을 하더라도 계속 untracked 상태로 남는다.

![파일의 라이프사이클](img/git-lifecycle.png)

Tracked 파일은 예전에 한번 커밋된 적이 있어 저장소에 있거나 혹은 현재 Staging
Area에 있는 파일이다. Tracked 파일은 다시 또 Unmodified, Modified, Staged 상태
중 하나로 구분된다. Unmodified 파일은 현재 작업 디렉토리에 있는 파일이 저장소에
있는 파일과 같은 경우를 뜻하며, 만일 Unmodified 파일을 수정하면 Git은 그 파일을
Modified 상태로 인식한다. 다만, modified 상태의 파일은 commit 명령을 하더라도
저장소에 기록되지 않는데, 저장소에 기록되기 위해서는 modified 상태가 아닌
staged 상태가 되어야 한다. 이를 이용해서 현재 작업 디렉토리에서 이력으로 남기고
싶은 부분만 커밋을 하는 식으로 버전 관리를 할 수 있다.

실제 예제를 확인해보도록 하자. 앞서 clone한 디렉토리로 가서 `git status`
명령어를 실행해보자:
```bash
$ cd /tmp/cloned
$ git status
On branch master
Your branch is up to date with 'origin/master'.

nothing to commit, working tree clean
```
위의 내용은 작업 디렉토리의 모든 파일이 unmodified 상태임을 의미한다. Untracked
파일은 아직 없어서 목록에 나타나지 않는다. 그리고 첫번째 줄에서 현재 작업 중인
브랜치의 이름(여기서는 master)을 알려주며 두번째 줄은 서버의 같은 브랜치로부터
진행된 작업이 없는 것을 나타낸다.

프로젝트에 `CONTRIBUTING.md` 파일을 만들어보면, 새로운 파일이기 때문에 Git이
Untracked files로 처리되는 것을 확인할 수 있다:
```bash
$ touch CONTRIBUTING.md
$ git status
On branch master
Your branch is up to date with 'origin/master'.

Untracked files:
  (use "git add <file>..." to include in what will be committed)

    CONTRIBUTING.md

nothing added to commit but untracked files present (use "git add" to track)
```
Git은 Untracked 파일을 아직 커밋에 넣어지지 않은 파일이라고 여기며, 파일이
Tracked 상태가 되기 전까지는 Git은 절대 그 파일을 커밋하지 않는다. 그래서
일하면서 생성하는 바이너리 파일 같은 것을 커밋하는 실수는 하지 않게
된다. `git add` 명령어로 `CONTRIBUTING.md` 파일을 추가해서 직접 Tracked 상태로
만들어보자:
```bash
$ git add CONTRIBUTING.md
$ git status
On branch master
Your branch is up to date with 'origin/master'.

Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

    new file:   CONTRIBUTING.md
```
상태를 보면 알겠지만 단순히 Tracked 파일로 추가한 것 뿐만이 아니라 `Changes to
be committed` 상태, 즉 Staged를 의미한다.

이미 Tracked 상태인 파일을 수정하는 법을 알아보자. `README`라는 파일을 수정하고 나서 git status
명령을 다시 실행하면 결과는 아래와 같다.
```bash
$ echo " Jr." >> README
$ git status
On branch master
Your branch is up to date with 'origin/master'.

Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

    new file:   CONTRIBUTING.md

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

    modified:   README
```
이 `README` 파일은 `Changes not staged for commit`에 있다. 이것은 수정한 파일이
Tracked 상태이지만 아직 Staged 상태는 아니라는 것이다. Staged 상태로 만들려면
`git add` 명령을 실행해야 한다. `git add` 명령은 파일을 새로 추적할 때도
사용하고 수정한 파일을 Staged 상태로 만들 때도 사용한다. Merge 할 때 충돌난
상태의 파일을 Resolve 상태로 만들때도 사용한다. `add`의 의미는 프로젝트에
파일을 추가한다기 보다는 다음 커밋에 추가한다고 받아들이는게 좋다.
```bash
$ git add README
$ git status
On branch master
Your branch is up to date with 'origin/master'.

Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

    new file:   CONTRIBUTING.md
    modified:   README
```
두 파일 모두 Staged 상태이므로 다음 커밋에 포함된다. 하지만 아직 더 수정해야
한다는 것을 알게 되어 바로 커밋하지 못하는 상황이 되었다고 생각해보자. 이
상황에서 `README` 파일을 열고 수정한다. 이제 커밋할 준비가 다 됐다고 생각할
테지만, Git은 그렇지 않다.
```bash
$ echo "Lorem ipsum" >> README
$ git status
On branch master
Your branch is up to date with 'origin/master'.

Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

    new file:   CONTRIBUTING.md
    modified:   README

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

    modified:   README
```
`README`가 Staged 상태이면서 *동시에* Unstaged 상태로 나온다. 어떻게 이런 일이
가능할까? `git add` 명령을 실행하면 Git은 파일을 바로 Staged 상태로
만든다. 지금 이 시점에서 커밋을 하면 `git commit` 명령을
실행하는 시점의 버전이 커밋되는 것이 아니라 마지막으로 `git add` 명령을
실행했을 때의 버전이 커밋된다. 그러니까 `git add` 명령을 실행한 후에 또 파일을
수정해서 커밋하고 싶으면 `git add` 명령을 다시 실행해서 최신 버전을 Staged
상태로 만들어야 한다.

## 4 변경 사항 비교

단순히 파일이 변경됐다는 사실이 아니라 어떤 내용이 변경됐는지 살펴보려면 `git
status` 명령이 아니라 `git diff` 명령을 사용해야 한다. 보통 우리는 '수정했지만,
아직 Staged 파일이 아닌 것?'과 '어떤 파일이 Staged 상태인지?'가 궁금하기 때문에
`git status` 명령으로도 충분하다. 더 자세하게 볼 때는 `git diff` 명령을
사용하는데 Patch처럼 어떤 라인을 추가했고 삭제했는지가 궁금할 때 사용한다.

그냥 `git diff`를 실행하면 수정했지만 아직 staged 상태가 아닌 파일을 비교해 볼
수 있다. 즉, 작업 디렉토리의 내용과 Staging area의 내용을 비교해준다. 이 때,
`git diff` 명령은 마지막으로 커밋한 후에 수정한 것들 전부를 보여주지
않는다. `git diff` 는 Unstaged 상태인 것들만 보여준다. 이 부분이 조금 헷갈릴 수
있다. 수정한 파일을 모두 Staging Area에 넣었다면 `git diff` 명령은 아무것도
출력하지 않는다.
```bash
$ git diff
diff --git a/README b/README
index 249dbdc..573cec9 100644
--- a/README
+++ b/README
@@ -4,3 +4,4 @@ SimpleGit Ruby Library
 
 This library calls git commands and returns the output.
 
Author : Scott Chacon Jr.
+Lorem ipsum
```
저장소에 커밋한 것과 Staging Area에 있는 것을 비교하려면 `git diff --staged`를
이용한다:
```bash
$ git diff --staged
diff --git a/CONTRIBUTING.md b/CONTRIBUTING.md
new file mode 100644
index 0000000..e69de29
diff --git a/README b/README
index a906cb2..fbc2d04 100644
--- a/README
+++ b/README
@@ -3,4 +3,4 @@ SimpleGit Ruby Library
 
 This library calls git commands and returns the output.
 
-Author : Scott Chacon
+Author : Scott Chacon Jr.
```

## 5 변경사항 커밋하기

수정한 것을 커밋하기 위해 Staging Area에 파일을 정리했다. Unstaged 상태의
파일은 커밋되지 않는다는 것을 기억해야 한다. Git은 생성하거나 수정하고 나서
`git add` 명령으로 추가하지 않은 파일은 커밋하지 않는다. 그 파일은 여전히
Modified 상태로 남아 있다. 커밋하기 전에 `git status` 명령으로 모든 것이 Staged
상태인지 확인할 수 있다. 그 후에 `git commit` 을 실행하여 커밋하는데, `-m`
옵션을 사용하여 커밋 메세지를 첨부하여야 한다.
```bash
$ git commit -m 'statgpu Tutorial'
[master 5175e4c] statgpu tutorial
 2 files changed, 1 insertion(+), 1 deletion(-)
 create mode 100644 CONTRIBUTING.md
$ git status
On branch master
Your branch is ahead of 'origin/master' by 1 commit.
  (use "git push" to publish your local commits)

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

    modified:   README

no changes added to commit (use "git add" and/or "git commit -a")
```
메세지로부터 쉽게 알 수 있듯, `README` 파일과 `CONTRIBUTING.md`의 수정 내역이
성공적으로 커밋되었으며, 앞선 예제에서 Stage하지 않았던 `README`의 수정 부분은
커밋되지 않고 modified 상태로 계속 남아있음을 확인할 수 있다. Git은 Staging
Area에 속한 스냅샷을 커밋한다는 것을 기억해야 한다. 수정은 했지만, 아직 Staging
Area에 넣지 않은 것은 다음에 커밋할 수 있다. 커밋할 때마다 프로젝트의 스냅샷을
기록하기 때문에 나중에 스냅샷끼리 비교하거나 예전 스냅샷으로 되돌릴 수 있다.

## 6 파일 삭제 및 이름 변경

`git rm` 및 `git mv` 명령어를 사용한다. 그냥 `rm`나 `mv`를 하는 경우는 작업
디렉토리에서만 지워지거나 변경되므로, `git rm` 및 `git mv` 명령어를 이용해
파일의 삭제나 변경을 Staging area에 넣은 뒤 커밋까지 완료해야지 Git 저장소에서
파일이 삭제되거나 이름이 변경된다.

## 7 커밋 기록 조회

`git log` 명령어를 실행하면 현재 브랜치를 기준으로 지금까지의 커밋 기록를
시간순으로 출력한다.
```
$ git log
commit 5175e4cd097c06ee6dead88ba9ed4044c9b22a2b (HEAD -> master)
Author: Alice <alice@mail.com>
Date:   Tue Jun 19 23:13:00 2018 +0900

    statgpu tutorial

commit ca82a6dff817ec66f44342007202690a93763949 (origin/master, origin/HEAD)
Author: Scott Chacon <schacon@gmail.com>
Date:   Mon Mar 17 21:52:11 2008 -0700

    changed the verison number

commit 085bb3bcb608e1e8451d4b2432f8ecbe6306e7e7
Author: Scott Chacon <schacon@gmail.com>
Date:   Sat Mar 15 16:40:33 2008 -0700

    removed unnecessary test code

commit a11bef06a3f659402fe7563abf99ad00de2209e6
Author: Scott Chacon <schacon@gmail.com>
Date:   Sat Mar 15 10:31:28 2008 -0700

    first commit
```

## 8 원격 저장소의 사용

원격 저장소는 인터넷이나 네트워크 어딘가에 있는 저장소를 말하며, 보통
[GitLab]이나 [GitHub] 같은 사이트에 원격 저장소를 많이 만든다. 다른 사람들과
협업하기 위해서는 원격 저장소의 사용이 필수불가결하다.

`git remote` 명령으로 현재 프로젝트에 등록된 원격 저장소를 확인할 수 있다. 만일
저장소가 clone된 저장소였다면 origin이라는 원격 저장소가 자동으로 등록되기
때문에 origin이라는 이름을 볼 수 있다. 만일 등록된 원격 저장소가 없는 경우는
`git remote add` 명령어를 이용하여 원격 저장소를 등록할 수 있다.
```bash
$ cd /tmp/cloned
$ git remote -v
origin  https://github.com/schacon/simplegit-progit (fetch)
origin  https://github.com/schacon/simplegit-progit (push)
$ git remote add tmp https://gitlab.com/alice/tutorial
$ git remote -v
origin  https://github.com/schacon/simplegit-progit (fetch)
origin  https://github.com/schacon/simplegit-progit (push)
tmp     https://gitlab.com/alice/tutorial (fetch)
tmp     https://gitlab.com/alice/tutorial (push)
```

등록된 원격 저장소는 `git remote rename`으로 이름을 바꾸거나 `git remote
rm`으로 제거할 수 있다.
```bash
$ git remote rename tmp temp
$ git remote -v
origin  https://github.com/schacon/simplegit-progit (fetch)
origin  https://github.com/schacon/simplegit-progit (push)
temp    https://gitlab.com/alice/tutorial (fetch)
temp    https://gitlab.com/alice/tutorial (push)
$ git remote rm temp
$ git remote -v
origin  https://github.com/schacon/simplegit-progit (fetch)
origin  https://github.com/schacon/simplegit-progit (push)
```

원격 저장소에서 데이터를 가져오려면 `git fetch` 명령어를 실행하면 되는데,
로컬에는 없지만 원격 저장소에는 있는 데이터를 모두 가져온다. 그러면 리모트
저장소의 모든 브랜치를 로컬에서 접근할 수 있어서 언제든지 merge를 하거나 내용을
살펴볼 수 있다. `git pull` 명령은 원격 저장소에서 데이터를 fetch한 다음
자동으로 로컬 브랜치와 merge시키는 작업도 진행한다.

로컬에서 작업한 커밋들을 원격 저장소로 보내려면 `git push` 명령어를
사용한다. 예를 들어, origin 원격 저장소로 master 브랜치를 올리고 싶으면
터미널에서 `git push origin master`를 실행하면 된다. 다만, push를 하기 위해서는
원격 저장소에 쓰기 권한을 가지고 있어야 하고, 다른 사람이 push한 작업이 원격
저장소에 있다면 로컬로 가져와서 merge를 먼저 한 뒤에 push를 해야한다.

## 9 고오급 기능들: branch, merge, rebase, stash, ...

앞서 소개한 기능들은 Git의 매우 기초적인 기능들로, 이 정도만 알아도 혼자서
간단한 프로젝트의 버전 관리 정도는 할 수 있을것으로 여겨진다.

다만, 다른 사람들과 협업을 하거나, 혹은 다양한 버전의 소스코드를 동시에
다루고자 할 때는 기초적인 기능들로는 많이 부족하다. 이를 효율적으로 다루기
위해서는 Git의 여러 고급기능들에 익숙해져야하며, 특히 엄청나게 막강한 branch
기능 및 [GitFlow] 같은 branching model에 익숙해 지는것이 필수이다. 중요한
기능이지만 꽤 방대한 분량이기에, 이를 매뉴얼에서 마저 소개하기 보다는 [Pro Git]
같은 다른 레퍼런스를 통해서 익히는 것을 권한다.

[Git]: https://git-scm.com
[GitLab]: https://gitlab.com/
[GitHub]: https://github.com/
[Pro Git]: https://git-scm.com/book/ko/v2
[Visual Git Reference]: https://marklodato.github.io/visual-git-guide/index-ko.html
[GitFlow]: https://nvie.com/posts/a-successful-git-branching-model/

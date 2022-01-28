---
tags:
  - programming
  - server
  - manual
---

# Slurm 사용법

학과 계산서버에 접속하였을 때, 접속한 서버는 master 노드로, 실제 계산과정이
이루어지는 worker 노드가 아니다. 실제 CPU나 GPU를 사용한 작업을 하기 위해서는
하는 작업을 명시한 다음 이를 master 노드에 요청하여 master 노드가 이를 다른
worker 노드로 보내는 과정을 거쳐야 한다. 학과 클러스터는 [slurm]이라는 스케쥴러
프로그램을 사용하여 이를 관리하고 있다.

Slurm의 기본 명령어들에는 다음 명령어들이 있다.

| 명령어     | 내용                        |
|------------|-----------------------------|
| `srun`     | 작업 제출 (interactive)     |
| `sbatch`   | 작업 제출 (non-interactive) |
| `scancel`  | 제출한 작업 취소            |
| `sinfo`    | 노드 정보 확인              |
| `squeue`   | 제출된 작업들 확인          |
| `scontrol` | 작업의 자세한 상태 확인     |
| `smap`     | 작업 상태 및 노드 상태 확인 |

## 1 `sbatch`: 작업 제출

`sbatch` 프로그램은 스크립트 파일을 받아 worker의 자원을 할당받고 할당받은
노드에서 작업을 실행하는 역할을 한다. `sbatch`에 요청하는 스크립트 파일은 일반
`bash` 스크립트 파일과 동일하나, `#SBATCH `로 시작하는 `bash` 주석에[^slurm-1]
`sbatch`와 관련된 설정을 명시할 수 있다. 보통은 할당받을 자원(CPU, GPU 등)을
명시하는 목적으로 쓰인다. 다음은 스크립트 예제인데, 앞에 여러 설정들을
적어놓고, worker 노드에서 실행될 코드를 아래에 적어 놓은것을 확인할 수 있다.

[^slurm-1]: `bash`에서는 주석 처리되어 아무런 기능을 하지 않으나 `sbatch`는 이런
    라인들을 해석한다. 앞에 `#`과 `SBATCH` 사이 띄어쓰기가 없고, `SBATCH` 바로
    뒤에는 띄어쓰기가 있음에 유의하라.

```{.bash .numberLines}
#!/bin/bash

#SBATCH --mail-user=address@mail.com # 알림을 받을 메일 주소
#SBATCH -J foobar  # 작업 이름
#SBATCH -t 0-00:30:00  # 최대 작업 시간; 이 시간이 지나면 강제 종료된다. 2일이 최대.
#SBATCH --partition gpu  # 작업 파티션 이름; cpu 또는 gpu
#SBATCH --nodes=1  # 할당받을 전체 노드 개수; 현재 4대의 worker 노드가 존재.
#SBATCH --ntasks=1  # 실행할 전체 작업의 개수; 적은 개수만큼 동일한 작업을 실행한다.
#SBATCH --cpus-per-task=2  # 작업 하나마다 할당할 cpu의 개수
#SBATCH --gres=gpu:2  # 노드마다 할당받을 gpu 개수; gpu 파티션에서만 사용

# 아래는 실제 실행되는 쉘 스크립트 코드
# 이 때 SLURM_ 으로 시작되는 환경변수들을 사용할 수 있다. 자세한 것은 공식 매뉴얼 참조.
echo "===== BEGIN $SLURM_JOB_NAME ($SLURM_JOB_ID) AT $(date) ====="
echo 'from tensorflow.python.client import device_lib; print(device_lib.list_local_devices())' | python
echo "==== FINISH $SLURM_JOB_NAME ($SLURM_JOB_ID) AT $(date) ====="
```

위와 같이 `example.sh` 스크립트 파일을 작성하였으면 다음과 같이 작업을 실행할
것을 요청할 수 있다. 작업을 요청하면 바로 시작하는 경우도 있으나, 만일
계산서버의 모든 자원이 사용중이여서 작업을 할 수 없는 경우는 다른 작업이
끝나기를 기다렸다가 작업을 시작한다.
```bash
$ sbatch example.sh
Submitted batch job 5174
```

모든 `sbatch` 작업의 출력은 `slurm-####.out` 파일에 저장된다.
```bash
$ cat slurm-5174.log
===== BEGIN foobar (5174) AT Mon Mar 5 16:08:21 KST 2018 =====
/device:GPU:0
/device:GPU:1
==== FINISH foobar (5174) AT Mon Mar 5 16:08:24 KST 2018 =====
```

### 1.1 자원 할당과 관련하여

현재 계산서버에는 4개의 worker 노드가 있으며, worker 노드 하나당 cpu 코어 40개,
gpu 2개를 가지고 있다. 따라서 `sbatch`에서 필요한 자원을 할당 받을 때, 이 점을
고려하여 필요한 만큼 적으면 된다. gpu의 사용은 gpu 파티션에서만 가능하며,
gpu 파티션은 cpu를 worker 하나 당 최대 2개밖에 할당 받을수 없음을 유의하라.
작업 시간은 cpu, gpu 상관없이 한 번에 최대 2일만 할당됨을 유의하라.

어떤 식으로 자원을 할당 받아야 하는지는 하고자 하는 작업의 성격에 따라 다를 수
있다. 요컨대 똑같이 cpu 코어 40개를 받는다 하여도 하나의 노드에서 하나의
작업을 실행하고 거기에 40개를 모두 배정할 수도, 4개의 노드에서 4개의 작업을
실행해 작업 하나에 10개씩 배정할 수도, 혹은 2개의 노드에서 40개 작업을 실행하고
작업 하나에 하나씩 배정할 수도 있다. 이는 전적으로 여러분의 선택이므로, 자신이
짠 프로그램의 성질을 잘 고려하여 요령껏 자원을 할당받도록 하자.

자원을 할당 받을 때 참고가 될만한 use case들은 뒤에서 다루도록 한다.

## 2 `scontrol`: 제출된 작업의 상세정보 조회
```bash
$ scontrol show job 5174
```

## 3 `squeue`: 제출된 작업 목록 조회

```bash
$ squeue
             JOBID PARTITION     NAME     USER ST       TIME  NODES NODELIST(REASON)
              5174       gpu   foobar bayesian PD       0:00      1 (Resources)
```

## 4 `scancel`: 제출한 작업 취소

```bash
$ scancel 5174
$ squeue
             JOBID PARTITION     NAME     USER ST       TIME  NODES NODELIST(REASON)
```

## 5 `sinfo`: Worker 노드 및 파티션 정보 조회

```bash
$ sinfo
PARTITION AVAIL  TIMELIMIT  NODES  STATE NODELIST
cpu*         up 2-00:00:00      4   idle n[1-4]
gpu          up 2-00:00:00      4   idle n[1-4]
```

[slurm]: https://slurm.schedmd.com/

# Use cases
#programming #example

이 장에서는 실제로 어떤 식으로 `slurm`을 이용하여 자원을 할당
받아야 하는지 여러 간단한 use case를 통해 알아보도록 한다.[^usecase-1]

[^usecase-1]: 물론 여기 있는 예시들은 *매우 간단한* 예시들만을 다뤘으며, 여기
    있는 예시들을 결합하거나 혹은 예시로 들지 않은 다른 구조를 사용하는 등
    멀티코어를 이용하는 방법들은 다양하다. 매뉴얼의 예시 이상의 사용법은 직접
    연구를 하여 사용법을 익히기를 권장한다.

## 1 `sbatch` Script Using Multithreading

하나의 작업을 실행하고 그 작업을 여러 Thread가 진행하는 경우로, OpenBLAS나
Intel MKL 같은 멀티코어 수치해석 라이브러리를 사용하는 경우가 여기에 해당한다.
일반 컴퓨터에서 돌아가는 프로그램 소스 코드를 특별히 수정하지 않아도 서버
자원들을 모두 활용할 수 있으나, 하나의 노드밖에 쓰지 못한다.

### 1.1 + OpenBLAS
#blas

다음과 같은 방식으로 `sbatch` 스크립트를 작성한다.
```{.bash .numberLines}
#!/bin/bash
#SBATCH --partition cpu
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=38

# 환경변수 설정: OpenBLAS가 사용할 CPU 코어 개수를 정해줌
export OMP_NUM_THREADS=$SLURM_CPUS_PER_TASK
export MKL_NUM_THREADS=$SLURM_CPUS_PER_TASK

# 필요한 모듈 로드
module purge; module load gnu7 openblas R

# 실행
Rscript script.R
```

### 1.2 Python + Intel MKL
#blas

다음과 같은 방식으로 `sbatch` 스크립트를 작성한다.
```{.bash .numberLines}
#!/bin/bash
#SBATCH --partition cpu
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=38

# 환경변수 설정: Intel MKL이 사용할 CPU 코어 개수를 정해줌
export OMP_NUM_THREADS=$SLURM_CPUS_PER_TASK
export MKL_NUM_THREADS=$SLURM_CPUS_PER_TASK

# 필요한 모듈 로드
module purge; module load intel numpy

# 실행
python script.R
```

## 2 `sbatch` Script Using MPI

여러 개의 작업을 실행하고 각각의 작업들이 서로 MPI 규격으로 자료를 주고받고
통신하면서 작업을 진행하는 경우이다. MPI를 이용하기 위해서는 특정 MPI 구현체의
API를 이용하여 새로 프로그램을 작성해야 하나, 여러 노드의 자원들을 활용할 수 있다.

### 2.1 + OpenMPI

다음과 같은 방식으로 `sbatch` 스크립트를 작성한다.
```{.bash .numberLines}
#!/bin/bash
#SBATCH --partition cpu
#SBATCH --ntasks=150

# 필요한 모듈 로드
module purge; module load gnu7 R openmpi

# 실행
Rscript script.R
```

### 2.2 Python + OpenMPI

다음과 같은 방식으로 `sbatch` 스크립트를 작성한다.
```{.bash .numberLines}
#!/bin/bash
#SBATCH --partition cpu
#SBATCH --ntasks=150

# 필요한 모듈 로드
module purge; module load gnu7 openmpi numpy scipy

# 실행
python script.py
```

## 3 `sbatch` Script Using GPU
#gpu

GPU를 사용하고자 하는 경우이다.

### 3.1 Python + Tensorflow

다음과 같은 방식으로 `sbatch` 스크립트를 작성한다.
```{.bash .numberLines}
#!/bin/bash
#SBATCH --partition gpu
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=2
#SBATCH --gres=gpu:1

# 필요한 모듈 로드
module purge; module load cuda

# 실행
python script.py
```

## 4 Interactive Job With `srun`

자료분석이나 기계학습 분야에서는 위와 같이 스크립트 파일을 작성하기 보다는
interactive한 작업 환경을 구축하는 것이 더 자연스럽고 효율적이다. `slurm`의
`srun`을 이용하면 worker 노드로부터 자원을 할당받아 interactive하게 작업을 할
수 있다. 구체적인 설정은 `sbatch`의 것과 동일하다.

```bash
# CPU 파티션의 한 노드로부터 32개 코어를 이틀간 할당받은 뒤 bash를 실행
$ srun -N 1 -t 2-00:00:00 -I --pty -p cpu -c 32 /usr/bin/bash
# GPU 파티션의 한 노드로부터 1개 GPU를 이틀간 할당받은 뒤 bash를 실행
$ srun -N 1 -t 2-00:00:00 -I --pty -p gpu --gres=gpu:1 /usr/bin/bash
```

위와 같이 자원을 할당받으면 각 worker 노드에서 bash가 실행된 모습을 확인할 수
있으며, 평소 리눅스 서버에서 작업을 하듯 자유롭게 작업을 할 수 있다.

작업의 제출은 Ctrl+c로 취소할 수 있으며 쉘이 종료되면 작업도 함께 종료되므로 앞서 소개한
tmux와 함께 사용할 것을 권장한다. 또한, `srun`으로 실행한 프로그램에 SSH 터널링으로 
접속을 원할 때는 해당 노드에 다시 터널을 열어주어야 한다. 

예를 들어, srun을 통해 n1 노드를 할당받고 8888번 포트로 주피터 노트북을 실행했다고 하자.
로컬에서 노트북에 접속하기 위해서는 다음과 같은 SSH 터널링을 이용할 수 있다.
```bash
~ ssh -t -t -p 2222 alice@server.address.com -L 8888:localhost:8888 ssh n1 -L 8888:localhost:8888
```


## 5 Slurm APIs

`srun`을 이용하거나 `sbatch` 스크립트를 작성하는 대신 프로그램 자체에서 slurm과
통신하는 패키지를 사용할 수도 있다. 이 때는 명시적으로 `sbatch`를 사용하는
대신, master 노드에 패키지를 설치하고 실행하면 된다. R의 경우는 [rslurm],
Python의 경우는 [pyslurm]을 이용할 수 있는데, 자세한 내용은 각각 패키지 문서를 참고하라.

[rslurm]: https://cran.r-project.org/web/packages/rslurm/vignettes/rslurm.html
[pyslurm]: https://pyslurm.github.io/

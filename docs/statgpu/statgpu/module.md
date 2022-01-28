---
tags:
  - server
  - programming
  - manual
  - linux
---

# `module` 사용법

`module`은 계산서버에 설치된 각종 컴파일러, 라이브러리, 주요 프로그램에 관련된
환경 설정을 쉽게 할 수 있도록 도와주는 보조 프로그램이다. 요컨대, 여러분이
서버에 설치된 어떤 프로그램을 사용하고자 할 때, `module` 명령어를 이용하면
손쉽게 그 프로그램을 사용하기 위한 준비를 마칠 수 있다. 예를 들어, C++
컴파일러로 g++ 대신 Intel C++을 사용하고자 한다거나, MPI 인터페이스로 OpenMPI
대신 MVAPICH를 사용하려 할 때 일일이 환경설정을 손으로 수정할 필요 없이
`module` 명령어로 쉽게 쉘 환경을 변경할 수 있다.

`module`의 경우 man page는 없지만 쉘에서 `module`을 아무런 인자 없이 실행하면
사용가능한 모든 명령어들을 보여준다. 매뉴얼에서는 그 중 자주 사용되는 명령어만
다루도록 한다.

## 1 `module available`: 사용가능한 모듈을 확인
```bash
$ module available
---------------------- /opt/ohpc/pub/moduledeps/gnu7-openmpi ----------------------
   adios/1.11.0    mpiP/3.4.1              petsc/3.7.6        scorep/3.0
   boost/1.63.0    mumps/5.1.1             phdf5/1.10.0       sionlib/1.7.1
   fftw/3.3.6      netcdf-cxx/4.3.0        scalapack/2.0.2    superlu_dist/4.2
   hypre/2.11.1    netcdf-fortran/4.4.4    scalasca/2.3.1     tau/2.26.1
   imb/4.1         netcdf/4.4.1.1          scipy/0.19.0       trilinos/12.10.1

-------------------------- /opt/ohpc/pub/moduledeps/gnu7 --------------------------
   R/3.3.3     (L)    metis/5.1.0     ocr/1.0.1              superlu/5.2.1
   gsl/2.3            mpich/3.2       openblas/0.2.19 (L)
   hdf5/1.10.0        mvapich2/2.2    openmpi/1.10.7  (L)
   impi/2017.3        numpy/1.12.1    pdtoolkit/3.23

---------------------------- /opt/ohpc/pub/modulefiles ----------------------------
   EasyBuild/3.2.1             example1/1.0            prun/1.1        (L)
   autotools          (L)      gnu/5.4.0               python/3.5.1
   clustershell/1.7.3          gnu7/7.1.0       (L)    singularity/2.3
   cuda/7.0                    intel/17.0.4.196        valgrind/3.12.0
   cuda/7.5                    ohpc             (L)
   cuda/8.0           (L,D)    papi/5.5.1

  Where:
   D:  Default Module
   L:  Module is loaded

Use "module spider" to find all possible modules.
Use "module keyword key1 key2 ..." to search for all possible modules matching any of the "keys".
```

## 2 `module list`: 현재 로드된 모듈을 확인
```bash
# 학과 계산서버는 다음 모듈들을 기본적으로 로드한다
$ module list
Currently Loaded Modules:
  1) autotools   3) gnu7/7.1.0       5) openblas/0.2.19   7) cuda/8.0
  2) prun/1.1    4) openmpi/1.10.7   6) R/3.3.3           8) ohpc
```

## 3 `module load`, `module rm`: 모듈을 로드하거나 제거
```bash
$ which python3
python3 not found
$ module load python/3.5.1
$ module list
Currently Loaded Modules:
  1) autotools    4) openmpi/1.10.7    7) cuda/8.0
  2) prun/1.1     5) openblas/0.2.19   8) ohpc
  3) gnu7/7.1.0   6) R/3.3.3           9) python/3.5.1
$ which python3
/opt/ohpc/pub/libs/python/3.5.1/bin/python3
$ module rm python/3.5.1
$ which python3
python3 not found
```

## 4 `module purge`: 로드된 모든 모듈을 제거
```bash
$ module purge
$ module list
No modules loaded
```

[MPI]: https://en.wikipedia.org/wiki/Message_Passing_Interface

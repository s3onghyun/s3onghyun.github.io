---
title: "Jaeger와 OTLP 사이에서 sampled 플래그를 보존한 기여"
description: 공개 병합 PR을 바탕으로 정리한 Jaeger와 OTLP 변환 과정의 sampled 상태 보존 작업 기록 초안입니다.
publishedAt: 2026-10-14
tags:
  - opentelemetry
  - jaeger
  - open-source
category: tech
draft: true
---

# Jaeger와 OTLP 사이에서 sampled 플래그를 보존한 기여

이 글은 [OpenTelemetry Collector Contrib의 병합 PR #49568](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/49568)를 바탕으로 정리한 공개 기여 기록의 초안이다.

## 문제: 변환 뒤에 사라지는 샘플링 상태

Jaeger와 OTLP 사이를 변환하는 코드는 Jaeger span의 `Flags`와 OTLP span의 `flags`를
그대로 이어 주지 않았다. 그래서 Jaeger receiver나 exporter가 포함된 파이프라인을
거치면 W3C Trace Context의 `sampled` 비트가 사라질 수 있었다.

이 정보는 확률 기반 샘플러, tail sampling processor, sampled 상태를 따르는 exporter가
판단할 때 쓸 수 있으므로, 변환 자체가 관측 데이터의 의미를 바꾸지 않게 하는 것이
중요했다.

## 공개 PR에서 확인할 수 있는 변경

- Jaeger의 `SampledFlag` 값 `1`을 OTLP `Span.flags`의 bit 0에 대응시켰다.
- Jaeger proto와 thrift를 OTLP로 읽는 두 방향, OTLP를 Jaeger proto로 쓰는 방향에 이 규칙을 적용했다.
- 원격 부모 여부를 나타내는 bit 8과 9는 범위 밖으로 두어, sampled 비트만 다뤘다.

## 회귀를 막는 테스트

PR에는 sampled와 not-sampled 각각에 대한 proto/thrift 변환 테스트와
Jaeger → OTLP → Jaeger 왕복 테스트가 포함되어 있다. 변환 경계의 작은 필드는 놓치기
쉬우므로, 양방향과 왕복을 함께 확인하는 테스트가 의도한 호환성 범위를 문서화해 준다.

다음에는 공개 코드와 이슈를 다시 보며, 프로토콜 사이의 플래그 매핑을 조사할 때
어떤 필드와 테스트 조합을 먼저 확인하면 좋은지 더 구체적으로 정리할 예정이다.

# PONG AI — Analytics Specification & Metric Contracts

## 1. Core Mathematical Metric Contracts

To avoid conflicting statistics between dashboards, benchmark reports, and Gemma 4 coaching prompts, all metrics are defined centrally in `shared/metrics.ts` and adhered to by both client and server.

### 1.1 Return Success Rate
- **Definition**: The proportion of eligible balls reaching the player's court that were returned successfully over the net and onto the opponent's side.
- **Formula**:
  $$\text{return\_success\_rate} = \frac{\text{successful\_returns}}{\text{eligible\_return\_attempts}}$$
- **Denominator**: $\text{eligible\_return\_attempts} = \text{successful\_returns} + \text{missed\_returns}$
- **Zero-Denominator Rule**: If $\text{eligible\_return\_attempts} == 0$, value is `null` (displayed as `"Insufficient Data"`, *never* a misleading `0%`).

### 1.2 Miss Rate
- **Definition**: The proportion of return attempts that resulted in a missed ball, net fault, or out-of-bounds hit.
- **Formula**:
  $$\text{miss\_rate} = \frac{\text{missed\_returns}}{\text{eligible\_return\_attempts}}$$
- **Invariant**: $\text{return\_success\_rate} + \text{miss\_rate} = 1.0$ (when $\text{eligible\_return\_attempts} > 0$).

### 1.3 Average Rally Length
- **Definition**: The mean number of valid racket contacts across completed rallies.
- **Formula**:
  $$\text{average\_rally\_length} = \frac{\text{total\_counted\_contacts}}{\text{completed\_rallies}}$$
- **Zero-Denominator Rule**: If $\text{completed\_rallies} == 0$, value is `null`.

### 1.4 Median Rally Length
- **Definition**: The median value of the array of rally lengths for all completed rallies in the session.
- **Formula**: Median calculation on sorted rally length array. If empty, `null`.

### 1.5 Interception Success Rate (AI Opponent)
- **Definition**: The ratio of successful opponent paddle deflections over opponent interception opportunities.
- **Formula**:
  $$\text{interception\_success\_rate} = \frac{\text{opponent\_successful\_hits}}{\text{opponent\_chances}}$$

### 1.6 Mean Reaction Time
- **Definition**: Average elapsed time in milliseconds between the opponent's paddle contact and the player's subsequent return strike.
- **Unit**: Milliseconds ($\text{ms}$).
- **Filtering**: Negative or out-of-order timestamps are purged; values $< 80\text{ms}$ or $> 2500\text{ms}$ are flagged as outliers.

---

## 2. Gesture & Computer Vision Metrics

### 2.1 Tracking Availability Percentage
- **Formula**:
  $$\text{tracking\_availability} = \frac{\text{valid\_tracking\_frames}}{\text{total\_eligible\_camera\_frames}} \times 100\%$$
- **Interpretation**: Measures how continuously the player's hand was detected during gameplay.

### 2.2 Missing-Frame Rate
- **Formula**: $100\% - \text{tracking\_availability}$.

### 2.3 Gesture Classification True Positive Rate (TPR / Sensitivity)
- **Formula**:
  $$\text{TPR}_c = \frac{\text{TP}_c}{\text{TP}_c + \text{FN}_c}$$
  Where $\text{TP}_c$ is true positives for gesture class $c$, and $\text{FN}_c$ is false negatives.
- **Zero-Denominator Rule**: If $\text{TP}_c + \text{FN}_c == 0$, value is `"Not Measurable"`.

---

## 3. Controller Benchmarking Protocol

The benchmark lab executes reproducible automated trials with a fixed set of pseudorandom seeds ($S \in \{42, 137, 256, 1024, 2048\}$):
- **Configurations Evaluated**: Easy, Medium, Hard baseline controller settings.
- **Recorded Telemetry**:
  1. Mean Interception Error ($\text{meters}$): Distance between paddle center and ball intersection point.
  2. Mean Response Delay ($\text{ms}$): Simulated reaction lag.
  3. Interception Success Rate ($\%$).
  4. Rally Length Distribution (P10, P50, P90).
- **Transparency**: Every reported benchmark displays the trial count ($N$), code version, and seed set. Synthetic data is explicitly badged as `[BENCHMARK DEMO]`.

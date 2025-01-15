### **Su et al. (2024)** *Analysis of the ICML 2023 Ranking Data: Can Authors' Opinions of Their Own Papers Assist Peer Review in Machine Learning?*  
**Buxin Su (UPenn), Jiayao Zhang (UPenn), Natalie Collina (UPenn), Yuling Yan (UW-Madison), Didong Li (UNC), Kyunghyun Cho (NYU), Jianqing Fan (Princeton), Aaron Roth (UPenn), Weijie J. Su (UPenn)**  
[arXiv:2408.13430](https://arxiv.org/abs/2408.13430) — *accessed Jan, 2025*  

---

**Tags**: Peer Review, Machine Learning, Author Rankings, Conference Submissions

---

## Mathematical Setup

Data: $Y_i$ i.i.d., split into $y \independent y'$

## My Thoughts

2025-01-14: The unbiasedness assumption seems questionable. In their data, conditional marginal unbiasedness is probably not the most useful interpretation, unless you ensure, e.g., stratified sampling between $y$ and $y'$. 

## Questions
- [ ] Unbiased

## Key Takeaways

* 

## Current Gaps
- [ ] 

---

## GPT-4o

**Abstract Summary**  
This paper presents an empirical analysis of how author-provided rankings can enhance peer review processes at machine learning conferences. During ICML 2023, authors with multiple submissions were asked to rank their papers based on perceived quality, resulting in 1,342 rankings covering 2,592 submissions. The study focuses on the Isotonic Mechanism, which calibrates raw review scores using these author rankings. Findings indicate that ranking-calibrated scores outperform raw scores in estimating the ground truth expected review scores. The authors propose cautious, low-risk applications of this mechanism, such as assisting senior area chairs, supporting paper award selections, and guiding emergency reviewer recruitment. The paper concludes by discussing limitations and suggesting future research directions. :contentReference[oaicite:1]{index=1}

**Key Points**  
- **Experiment Overview**: Authors with multiple submissions to ICML 2023 were asked to rank their own papers based on perceived quality. A total of 1,342 authors provided rankings for 2,592 submissions. :contentReference[oaicite:2]{index=2}

- **Isotonic Mechanism**: This mechanism calibrates raw review scores using author-provided rankings, aiming to improve the accuracy of peer review evaluations. :contentReference[oaicite:3]{index=3}

- **Performance Improvement**: The ranking-calibrated scores were found to outperform raw scores in estimating the ground truth expected review scores, measured by both squared and absolute error metrics. :contentReference[oaicite:4]{index=4}

- **Proposed Applications**: The authors suggest several applications for the Isotonic Mechanism, including:
  - Assisting senior area chairs in overseeing area chairs' recommendations.
  - Supporting the selection process for paper awards.
  - Guiding the recruitment of emergency reviewers. :contentReference[oaicite:5]{index=5}

- **Limitations and Future Research**: The paper discusses the study's limitations and proposes directions for future research to further explore the integration of author opinions in peer review processes. :contentReference[oaicite:6]{index=6}

**Insights and Brainstorms**  
- **Enhancing Review Accuracy**: Incorporating author rankings could serve as a supplementary tool to enhance the accuracy and fairness of peer review processes, potentially mitigating biases and inconsistencies.

- **Reviewer Calibration**: The Isotonic Mechanism could be used to calibrate reviewer scores, ensuring that evaluations align more closely with author insights and the paper's actual quality.

- **Resource Allocation**: Implementing author rankings might optimize the allocation of reviewing resources, allowing for more focused evaluations on submissions where discrepancies exist between author and reviewer assessments.

- **Ethical Considerations**: While author rankings can provide valuable insights, it's essential to consider potential ethical implications, such as authors inflating the perceived quality of their work. Establishing safeguards to maintain the integrity of the review process would be crucial.

**Questions and Further Reading**  
- **Scalability**: How scalable is the Isotonic Mechanism for conferences with a significantly larger number of submissions?

- **Generalizability**: Can the findings from this study be generalized to other academic fields beyond machine learning?

- **Author Bias**: What measures can be implemented to account for potential biases in author-provided rankings?

- **Longitudinal Impact**: How would the integration of author rankings affect the peer review process over multiple conference cycles?

- **Further Reading**:
  - "The Isotonic Mechanism for Exponential Family Estimation" by Yuling Yan, Weijie J. Su, and Jianqing Fan. :contentReference[oaicite:7]{index=7}
  - "Bridging Convex and Nonconvex Optimization in Robust PCA: Noise, Outliers, and Missing Data" by Yuxin Chen, Jianqing Fan, Cong Ma, and Yuling Yan. :contentReference[oaicite:8]{index=8}
  - "Model-Based Reinforcement Learning for Offline Zero-Sum Markov Games" by Yuling Yan, Gen Li, Yuxin Chen, and Jianqing Fan. :contentReference[oaicite:9]{index=9}

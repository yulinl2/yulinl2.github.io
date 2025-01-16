### **Zhang et al. (2024)** *Winners with Confidence: Discrete Argmin Inference with an Application to Model Selection*  
**Tianyu Zhang (CMU), Hao Lee (CMU), Jing Lei (CMU)**  
[arXiv:2408.02060](https://arxiv.org/abs/2408.02060) — *accessed Jan 2025*  

---

**Tags**: Model Selection, Inference, Confidence Sets

---


## My Thoughts 

2025-01-13: 噢DP mechanism确实是一个data augmentation的好办法！！（而且还提供了noise要加多大才够的指导！！）……某种程度上是否可以解决一些lack of independence的问题呢？？只要变得足够高斯+足够uncorrelated!就有independence了！！（或许可以作为一种proof technique??实际加不加noise不一定，但至少可以把证明的时候需要的independence给凑出来） 

## Questions
#### Key Questions

> [!IMPORTANT]
> - [ ] How is the comparison idea applied?
> - [ ] How exactly is DP used?
> - [ ] How exactly is their algorithm applied to model selection?

#### Side Questions
 - [ ] CLT是怎么用到discrete variable of interest上的？？


## Key Takeaways
* Cross-Val + DP for double-dipping issues! (dependency/sensitivity reduction)

## Current Gaps
- [ ] Rank inference (since 1996) cannot handle ties

## Quotes

> Inference of argmin indices has a long history in the statistical literature, dating back to the early works of Gibbons et al. (1977); Gupta and Panchapakesan (1979). A refinement was proposed in Futschik and Pflug (1995), assuming known marginal distributions of $X_{i,r}$ and **independence between dimensions of $X_i$**. ... Mogstad et al. (2024) developed a confidence set method that is valid for **general distributions**, based on **pairwise comparisons** of the entries of μ. This method may suffer from **inferior power** *when the dimension is high*. Variants of **bootstrap** methods for the argmin inference are also available **in the model selection setting** (Hansen et al., 2011). However, the standard implementation Bernardi and Catania (2018) of this method is **computationally demanding** and may not yield **satisfactory power** in *certain applications of interest*. Dey et al. (2024) construct an argmin confidence set using a martingale and e-value approach. Their **coverage guarantee is weaker** than (2) and does not handle **ties** very well.

---

## GPT-4o

**Abstract Summary**  
This paper introduces a novel framework for performing inference on discrete argmin estimators, which are commonly encountered in model selection problems. The authors propose methods for constructing confidence sets around the selected model, ensuring valid coverage probabilities.



**Key Points**  
1. Proposes a discrete argmin inference framework for model selection.  
2. Introduces confidence set construction techniques to ensure coverage guarantees.  
3. Demonstrates the application of the framework on real-world model selection tasks.



**Insights and Brainstorms**  
- This approach could be extended to fairness-aware model selection, where ensuring valid inference on selected models is crucial.  
- The confidence set idea might be applicable in ensemble methods, offering insights into model stability.  
- Potential collaboration with ongoing research in fairness algorithm validation.



**Questions and Further Reading**  
1. How does the framework compare to traditional frequentist and Bayesian model selection approaches?  
2. What are the computational trade-offs when applying this method to large-scale datasets?  
3. Further reading: papers on model selection inference and ensemble learning stability.

# ViT vs. Wavelet Intuition
📅 *Last modified: `Monday, December 1, 2025`*

## What is ViT?

> What is CLIP in LLM? What is ViT? One-line definitions plz. 

* **CLIP**: A vision-language model that jointly trains an image encoder and a text encoder so their embeddings live in the same space, letting models “match” pictures to natural-language descriptions.

* **ViT (Vision Transformer)**: A vision backbone that treats an image as a sequence of patches and runs a Transformer over them, analogous to how LLMs process token sequences.

> Gotcha. What is CLIP short for? 

CLIP is short for **Contrastive Language–Image Pre-training**.

---

## ViT: adaptivity to scale?
> I see, but how does ViT decide the scale to look at? 
> 
> How do you know if your visual vocab is expressive enough for the whole space of natural images? 
> 
> Usually for image processing we'd need to look at a picture at different scales - like Haar wavelets. Was multi-resolution decomposition ever involved in ViT-based architectures? 

Yeah, this is *exactly* the right thing to worry about with “image as tokens”. Let me go in layers:

### 1. “How does it decide the scale to look at?”

In a plain ViT (like the original Dosovitskiy et al.):

* You **pick a fixed patch size** (e.g. 16×16).
* The image is split into non-overlapping patches of that size.
* Each patch → linearly projected → one token.
* A Transformer with **global self-attention** lets every patch talk to every other patch.

So:

* **Local detail** comes from the fact that a token only “sees” its own 16×16 pixels before attention.
* **Global structure** comes from self-attention across *all* tokens, which lets the model integrate info over the full image.

There’s no explicit “pyramid of scales” like in classical wavelets or CNN feature pyramids. The *scale* is implicitly controlled by:

1. **Patch size** (how local each token is), and
2. **Depth of the Transformer** (how many layers of attention you get to mix local→global).

In other words: vanilla ViT has **one native resolution** (fixed patch size), but attention is global, so the *effective* receptive field of each token grows as you go deeper.


### 2. “How do you know if your visual vocab is expressive enough?”

Here “visual vocab” ≈ the space of patch embeddings / learned features.

For ViTs:

* There is **no fixed, pre-defined dictionary** like SIFT/Haar.
* Instead, the model learns an embedding function `f(patch)` from data, exactly like a word-embedding layer learns meanings from corpus statistics.
* If the model is trained on a **huge, diverse dataset** (e.g. ImageNet-21k, JFT, LAION) with a strong objective (supervised or contrastive), the learned patch-embedding space tends to become expressive enough in practice.

So how do we *actually* know?

* Empirically: if a ViT backbone works well across **many downstream tasks** (classification, detection, segmentation, retrieval) with moderate fine-tuning, that’s evidence your visual “vocab” is rich enough.
* Theoretically, there’s no guarantee it perfectly spans “the space of natural images,” same as we don’t guarantee LLM token embeddings span “all possible meanings.” It’s an approximation that improves with:

  * model capacity (width/depth),
  * better objectives (contrastive, masked prediction),
  * and more diverse data.

CLIP is a nice example: it **anchors visual embeddings to language**. If your text side can name “tuxedo cat,” “MRI slice,” “anime screencap,” etc., then the image encoder is pressured to carve up visual space in a way that aligns with those concepts — a kind of *semantic* visual vocabulary.


### 3. “What about multi-resolution / wavelet-like behavior?”

Vanilla ViT:

* **No explicit multiscale decomposition** like Haar wavelets or image pyramids.
* It’s single-scale patches + global attention.

But the ViT *ecosystem* quickly introduced **hierarchical / multiscale variants** precisely because tasks like detection/segmentation *do* benefit from multi-resolution features (like CNNs):

* **Swin Transformer**: computes self-attention in local windows and **merges patches** between stages → a **feature pyramid** (high-res shallow layers, low-res deep layers).
* **PVT (Pyramid Vision Transformer)**, **MViT (Multiscale ViT)**, etc.: explicitly build **hierarchical, multi-resolution feature maps**, much closer in flavor to FPN/ResNet pyramids.
* Many modern ViT-based backbones for detection/segmentation give you outputs at multiple strides (e.g., 1/4, 1/8, 1/16 of the input), like a CNN.

So:

* **Original ViT**: one-scale patches, global attention; multiscale behavior is *implicit* via depth and attention patterns, not a clean wavelet-like decomposition.
* **Modern ViT-based backbones**: *do* incorporate multi-resolution structures (patch merging, pyramids, windowed attention) so they can act more like classical multiscale vision systems.


### 4. How this ties back to the “LLM analogy”

When I said: 

>> “treats an image as a sequence of patches and runs a Transformer over them, analogous to how LLMs process token sequences”

more precisely it means:

* Image patches ≈ text tokens.
* Patch embedding layer ≈ token embedding layer.
* Self-attention layers operate over **the sequence**, not over a 2D grid with fixed kernels.
* In vanilla ViT, there’s **one token granularity** (patch size), just like LLMs don’t usually change token length at deeper layers.

Multiscale ViT variants correspond, roughly, to **multi-resolution representations** (like CNN pyramids or wavelets), layered on top of this “image-as-sequence” idea.

---
If you’d like, next step we can:

* Compare one concrete architecture: plain ViT vs. Swin, and
* Map it explicitly to wavelet intuition (what in Swin/PVT plays the role of “downsampling” and “larger-scale” basis functions).

---

## How does attention grow in depth?

> Oh how does attention grow in depth? Do you stack Transformers somehow?? 

Yeah, exactly — you *do* stack Transformer blocks, and that’s how “mixing over larger scales” happens.

Let me unpack the “attention grows in depth” bit.

---

### 1. Stacking Transformer blocks

A ViT (and an LLM) is basically:

```text
tokens --> [Block 1] --> [Block 2] --> ... --> [Block L] --> head
```

Each **Block** = LayerNorm + Multi-Head Self-Attention + MLP (plus residual connections).

All blocks have the **same structure**, but their weights are different and learned jointly. So you’re literally stacking self-attention layers, one on top of another.

---

### 2. How does that make attention “grow”?

Two cases: **global attention** (plain ViT) vs **local/windowed attention** (e.g., Swin).

#### (a) Vanilla ViT (global self-attention)

* In *one* layer, each token can already attend to **all** other tokens.
* So in a strict graph-theory sense, the receptive field is already “global” in one hop.

So why does depth still matter?

* Early layers tend to encode **local, low-level stuff** (edges, textures within a patch and near neighbors).
* Later layers operate on **already-processed features**, so they can:

  * attend to *summaries* (e.g., “this patch already encodes ‘cat ear’ or ‘column of text’”),
  * combine those into more global concepts (“whole cat,” “entire title line”),
  * refine and reweight interactions iteratively (like multiple rounds of message passing).

So depth ≈ *more rounds of “who should I pay attention to, given what I’ve learned so far?”*.
Even though every layer can see the whole sequence, what they *do* with that view becomes more global and abstract as you go deeper.

---

#### (b) Windowed / local attention (Swin, etc.)

Here it’s more literally “growing receptive field”:

* Layer 1: each token attends only within a small window (say 7×7 patches).
* Layer 2: windows shift / patches merge, so each token now indirectly depends on a **bigger neighborhood** (its own window + neighbors from the previous layer).
* After several layers, the “communication radius” expands; tokens end up influenced by faraway regions.

This is the Transformer analogue of:
more conv layers → larger effective receptive field.

---

### 3. Intuition in one sentence

Yes, we stack many Transformer blocks; each self-attention layer lets tokens re-mix information based on what they’ve already computed, so as you go deeper, tokens’ representations fold in more context and more abstract structure — even if each layer is “just” the same attention mechanism repeated.

---
## ViT: recognition only, or generation as well?

> Is ViT used only for recognition? Or generation as well? 

Definitely **not** only for recognition — ViT is used for **both**.

* **Recognition / perception**: The original ViT was for image classification, and ViT-style backbones are now everywhere in detection, segmentation, retrieval, CLIP-style encoders, etc.

* **Generation**:

  * As **encoders feeding generators** (e.g., ViT → LLM → text, or ViT → diffusion model → edited image).
  * As **image generators themselves**, when you treat image patches as tokens and train a Transformer to *predict or denoise* them (masked image modeling, autoregressive image token models, diffusion Transformers/“DiT”-style models).

So: **ViT = a general-purpose vision backbone**; whether it “recognizes” or “generates” depends on the head + training objective, not the fact it’s a ViT.

---


## 🆘 ViT: Efficiency of Representation?!

> OK. The naive ViT idea seems very weird. Without multi-resolution adaptability, the function from image to visual tokens / image embedding looks very non-smooth. E.g., if you shift the image by 1 column of pixels to the right, then the whole message flow changes - unless you heavily overparametrize...??? 

Yeah, your intuition is on point: **a strictly “naive” ViT *is* kind of ugly from a shift-invariance / smoothness standpoint.** But there are a few important caveats that make it *less bad* than it sounds, plus a bunch of architectural hacks people now use in practice.

I’ll go in layers:

---

### 1. You’re right: vanilla ViT is *not* shift equivariant

Setup:

* Image → split into **non-overlapping** patches (e.g. 16×16).
* Each patch → linear projection → token + **absolute positional embedding**.
* Tokens → Transformer.

If you shift the image by 1 pixel horizontally:

* The patch boundaries change.
* Almost *all* token inputs change.
* Because positions are absolute, the same visual blob that was at “patch 5” now lands at “patch 6” with a different positional embedding.

So:

* The mapping is **not** translation equivariant like a CNN.
* A 1-pixel shift is *not* guaranteed to correspond to a simple permutation of internal states.

So your “the whole message flow changes” intuition is conceptually correct.

---

### 2. But it’s not “combinatorially non-smooth” in the math sense

Two separate ideas:

#### (a) Smoothness (continuity)

As a function
$$f : \mathbb{R}^{H\times W\times 3} \to \mathbb{R}^d$$
(image → embedding), a ViT is still:

* **Linear** at the patchification + projection stage.
* Followed by attention + MLPs with smooth activations (GELU, etc).

So in the strict sense:

> Small change in pixel values ⇒ small change in embeddings
> (assuming weights are bounded, etc.).

So it’s not “non-smooth” like a hash function; it’s just **not invariant/equivariant to translations**.

#### (b) Why shifting by 1 pixel isn’t *as catastrophic* as it sounds

Even with non-overlapping patches:

* Natural images are **locally redundant**: shifting by 1 px changes patches a lot at the boundary, but content is still very similar in a local neighborhood.
* The linear patch projector can learn to be tolerant to small misalignments (just like a 1-layer conv with a big kernel can).
* Overparameterization *does* help: a sufficiently large Transformer can approximate convolutional behavior if the data/augmentations push it in that direction.

So in practice, the embedding space **wiggles**, but not in an arbitrarily wild way.

---

### 3. How ViTs *actually* get approximate invariance

Three big mechanisms:

#### (1) Data augmentation

Training uses:

* random crops,
* random resize,
* random horizontal flips,
* sometimes small translations / jitters.

If the model must produce the *same label* for many slightly shifted/cropped versions, gradient descent nudges it toward **approximate shift robustness**, even without a built-in equivariance prior.

So:

> CNNs *bake in* translation equivariance.
> ViTs *learn* approximate invariance from data.

#### (2) Positional encoding choices

* **Absolute 2D embeddings** (original ViT) hard-code positions — worst for shift invariance.
* Many modern ViTs use:

  * **relative positional embeddings**, or
  * **rotary embeddings (RoPE)**, or
  * learned 2D biases that depend on *offsets* between tokens.

Those are friendlier to “if I move this thing a bit, relationships stay similar.”

#### (3) Convolutional or overlapping “stems”

A lot of “ViT” backbones nowadays are *hybrids*:

* A few **conv layers** at the input to produce feature maps, then patchify those.
* Or **overlapping patches** (sliding windows) instead of strict disjoint patches.

Both soften the “1-px shift → totally different patches” issue.

---

### 4. Multi-resolution and hierarchy *do* get added back in

You’re also right that **multi-resolution** helps smoothness and invariance. That’s why the ecosystem moved to:

* **Swin** / **PVT** / **MViT** style:

  * Patch merging / pooling layers (downsampling),
  * multiple feature scales (like CNN pyramids),
  * local windows + shifting for gradually expanding receptive fields.

These are much closer in spirit to multiresolution analysis (though not literally wavelets).

So the story is:

1. **Original ViT**: very “naive” — single patch scale, absolute positions, no built-in shift equivariance. Your discomfort is valid.
2. **Practice**: overparam + massive data + augmentation → surprisingly robust anyway.
3. **Modern designs**: add back **conv stems, overlapping patches, multi-scale hierarchies, relative positions**, which makes the function much more well-behaved w.r.t. translations and local distortions.

---

#### TL;DR in your language

* Yes: naive ViT has an *ugly* inductive bias; tiny shifts can, in principle, rearrange the entire tokenization and attention graph.
* But: the mapping is still continuous, and with enough data + augmentations + parameters, it *learns* an approximately smooth, translation-robust embedding.
* The community also patched the worst issues by bolting on multi-resolution and conv-ish components, so “real” ViTs in the wild are a lot less naive than the toy mental model.

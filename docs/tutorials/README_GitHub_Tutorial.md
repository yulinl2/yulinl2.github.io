# For New Users of GitHub
Created: `02/13/2022 Yuiln (yulinli@bu.edu)`

Updated: `01/10/2025 Yuiln (yl2021@stat.rutgers.edu)`


## Initialize Your GitHub Folder: A Step-by-Step Instruction

1. Download the software **GitHub Desktop** 
   - available [here](https://desktop.github.com)
   - or [here for linux](https://linuxhint.com/install-and-use-github-desktop-on-ubuntu/)
2. Inside **GitHub Desktop**, click on `Current Repository` >> `Add` >> `Clone Repository...`
3. Under `URL`: 
   - Input the web URL to your target repository 
   	 - For the ML Fairness project: https://github.com/yulinl2/FaiREE_Missing_Data.git
   - Choose a `local path`, where you'd like to keep your local copy of the code
	 - For me, e.g., it is `/Users/liyulin/Github/FaiREE_Missing_Data`.
     - **Tips**: You'd better NOT have the GitHub folder under a cloud-synced folder traced by another agent, e.g., OneDrive, Dropbox, etc., just in case of syncing conflicts...(though this should be rare)
   - Click on `clone`
4. Click on `Fetch origin` >> `pull origin` to download the entire remote repository.

## What To Know about Version Control

### Basic Operations: Terms and Meanings

> **fetch/pull** = download 
	
* Syncs everything from the remote code base

> **commit** = cache

* Wraps up local changes in batches and 
* Buffers it to be ready to be uploaded

> **push** = upload

* Publishes the patches buffered changes



### WARNING: CHANGES CAN BE LOST, if not submitted correctly

For changes to be saved on the remote repo, **commit** alone is NOT enough!

> Do always remember to *also* **PUSH** after **commit**!

For changes to be saved on the remote repo, **commit** alone is NOT enough!

> Do always remember to *also* **PUSH** after **commit**!

For changes to be saved on the remote repo, **commit** alone is NOT enough!

> Do always remember to *also* **PUSH** after **commit**!



### Tips: Extra Backups Can Save Lives

Whenever you're about to make a *huge* change, 
e.g., 
* switching branches (this one is often overlooked),
* renaming / deleting a number of files, 
* merging codes, etc., 

it is always wise to do the following before you take any further actions, even when it looks unnecessary:

>	1. **COPY the entire local folder** you currently have (**compress** it if necessary), and 
>	2. **PASTE it somewhere else** on your computer, 
	
so that you have an *extra local copy* of *everything* in the older version you're about to *lose*!
	
(Keep in mind: sh*t happens.)
	
Once you're done with everything and have pulled all remote changes and verified they're fine, you'll be safe to remove that extra copy.



## What To Know about Collaborations

### WARNING: Version conflicts can happen

For students editing codes, it's always safer to 

* EITHER

	> 1. Create a **new copy** of any file you intended to edit, 
	> 2. **Rename** the new copy to include your name, and 
	> 3. Make whatever changes you'd like to make **inside** that new copy. 

	This way, your modifications will appear on your supervisor's end as a new file, which minimizes confusions among different versions of the same script. 
	
	(And you can discuss merging your code later.)

* OR

   > 1. Create a **new branch**, 
   > 2. Make changes **under** that branch, and 
   > 3. **Merge** that branch later into the main branch when we're certain.
   
...all of these just in case that multiple people happen to be changing the same script at the same time - even though GitHub is usually able to handle such conflicts, with some efforts. 

### Rule of Thumb: Use BRANCHES

To keep track of changes and be able to revert to an older version, you might want to **commit** and **push** frequently. 

However, to reduce conflicts (and avoid the insignificant commit messages piling up) in your **main branch**, it's always a good practice to **make our own branches** when editing code, and keep the **main branch** untouched during active development! 

When the latest version of files has been discussed and agreed upon among yourselves, we can go ahead and **merge** our branches into the master branch.

#### HOW-TO

1. Everything mentioned above can be easily done in the graphical interface on **GitHub Desktop**. 

2. Besides, you can also **view** and **download** contents from others' branches if you go to the repo webpage. 


### WARNING: Switching Branches OVERRIDES All Your Local Changes

Doing a **pull** from another branch will download **everything** in it into your local directory, which will ***OVERWRITE*** any changes you have not yet **committed+pushed**, which means
* ***PERMANENTLY REMOVING*** any ***local data files*** that 
	* you have saved under your **local** GitHub folder 
	* but were **unable to upload** to the **remote** code base
		* due to, e.g., file size limit (see details in the next section)
* with ***NO WARNING MESSAGES***, 

so be careful and 

* EITHER

> store local data files **outside** the traced GitHub folder (recommended),

* OR

> follow previous tips on making **extra local backups** BEFORE switching branches.



## Handling Large Data Files
  **Example Project**: Remote Sensing - Deforestation Detection

### A Step-by-Step Instruction

For those who haven't had the following data files downloaded

- ```Fusion/Code/data/Combined```
- ~~Fusion/GUIDATA/SentinelProcessedStart71.mat~~

please

1. **clone** this GitHub repository first, to create a local copy of the GitHub directory on your computer, and then
2. **download** the above data files/folders from the Dropbox shared folder (provide by Prof. Julio Castrillon) 
3. **place** the downloaded data files/folders at the designated locations on your local machine, under the local directory of this GitHub repository (for example, copy the downloaded folder `Combined` and paste it under `Fusion/Code/data/`). 

Once your local directory is initialized as instructed above, all the source control operations (commit/push/pull) can go on as usual, without any special attention to the above data files (unless additional data is added by @Julio). 

### Rationales

In this project, some (large) data files are intentionally disabled from GitHub syncing.

* When you "commit" new changes, the files specified in `.gitignore` will be ignored, i.e., not traced by GitHub, but you can still have those files sitting in your local GitHub folder untouched. 

	* For those interested in how this is done, see `.gitignore` located at the root directory of this repo. 
	* `.gitignore` is most likely a hidden file on your local directory; for Mac users, press `command`+`shift`+`.` to see them.

* We do so because large files **cannot be uploaded to GitHub.com** due to the **100-MB file size limit**.


	
With all the above considerations: 

* When you just need the large data files to sit under your GitHub code directory, e.g., for the codes to run on your local machine, you should follow the step-by-step instructions above to manually download them and place them at the correct locations. 


# Feel free to write anything in this `README.md` for notice

Just click on the pencil icon up there 👆 on the webpage! (And click on the commit button at the bottom 👇 to publish changes)

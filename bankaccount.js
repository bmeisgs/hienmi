class bankAccountMultipleNameException extends Error {
    setAccountList(acctList) {
	this.resultList = [];
	for(let i=0;i<acctList.length;i++) {
	    this.resultList.push({'name':acctList[i].ownerName,'birthday':acctList[i].ownerBirthdate,'number':acctList[i].accountNumber});
	}
    }
};

class bankAccount {
    /*
     * ------------------------------------------------------------------------
     * INSTANCE METHODS
     * ------------------------------------------------------------------------
     */
    /*
     * @constructor
     * @returns {bankAccount}
     */
    constructor() {
	/** @type {Number} */
	this.balance = 0;
	this.ownerName = 'anonymous bank account';
	this.ownerCommonName = '';
	this.ownerBirthdate = '0000-00-00';
	this.ownerMMName = '';
	this.accountNumber = '20172019-00000000';
	this.history = [];
    }
    /**
     * 
     * @param {Number} amount = negative amount withdraws from, positive amount deposits on the balance
     * @param {String} otherParty the other party in this transaction
     * @param {String} transactionId a unique transaction ID
     * @param {String} remark
     * @returns {bankAccount}
     */
    changeBalance(amount,otherParty,transactionId,remark) {
	if (typeof remark==='undefined') {
	    remark = '';
	}
	this.balance += amount;
	let date = new Date();
	let historyEntry = {
	    "when":date.toISOString(),
	    "whenUTS":date.getTime(),
	    "amount":amount,
	    "balanceAfter":this.balance,
	    "transactionId":transactionId,
	    "otherParty":otherParty,
	    "remark":remark
	};
	this.history.push(historyEntry);
	return this;
    }
    /**
     * Transfer funds from this account to another.
     * @param {String|bankAccount} recipient either as a bankAccount object, or an account number
     * @param {Number} amount to transfer
     * @param {String} remark additional remark
     * @returns {String}
     */
    transferTo(recipient,amount,remark) {
	return bankAccount.transfer(this,recipient,amount,remark);
    }
    /*
     * ------------------------------------------------------------------------
     * STATIC METHODS
     * ------------------------------------------------------------------------
     */
    /**
     * Return a "common name" format for a name (lowers the case).
     * @param {String} nam
     * @returns {unresolved}
     */
    static commonName(nam) {
	return nam.toLocaleLowerCase();
    }
    /**
     * Create a new bank account and place it in the accounts directory.
     * @param {String} ownerName
     * @param {String} birthDate YYYY-MM-DD format
     * @param {String} mothersMaidenName
     * @returns {bankAccount}
     */
    static createAccount(ownerName,birthDate,mothersMaidenName) {
	/* This condition checks if the *static* property "lastAccountNumber" is present on the bankAccount class object. */
	if (typeof bankAccount.lastAccountNumber==='undefined') {
	    /* If not present, it means the bankAccount system is not initialized, so we create two static properties:
	     * - bankAccount.lastAccountNumber will store the last given out account number,... */
	    bankAccount.lastAccountNumber = 0;
	    /* - bankAccount.accounts will store all accounts as a named array.
	     * We use a named array as it helps us access a certain bankAccount instance either by its account number or the owner's name.
	     * Since JavaScript implements named arrays as plain objects, we initialize this as a plain and empty object, using the
	     * object literal notation, which is:
	     * {"propertyName":propertyValue,"propertyName2":propertyValue2,...}
	     * which, when we use an object as a named array, is understood as:
	     * {"key1":value1,"key2":value2,...} */
	    bankAccount.accounts = {};
	}
	/* Now I need to increase the account number counter (bankAccount.lastAccountNumber) as we need to assign a new bank account number.
	 * This is important; I'm copying the account number after it's increased, thus it becomes an atomic operation. 
	 * An atomic operation means that when it's executed, it cannot be divided into suboperations, therefore during exection nothing can happen between its start and end.
	 * This needs to be atomic so that even if there are multiple concurrent calls for creating new bank accounts, each occasion will get a unique bank account number.
	 * Since the ++ is before the variable identifier, it means that the return value of the ++bankAccount.lastAccountNumber expression will be the increased value of it.
	 * If the ++ would be after, it would still increase bankAccount.lastAccountNumber, but the return value of the expression, that is stored in myAcctNumber, 
	 * would be bankAccount.lastAccountNumber *before* its value has been increased. */
	let myAcctNumber = ++bankAccount.lastAccountNumber;
	/* Since it's originally a Number, we cast it to a String as we will use the account number in a string. */
	myAcctNumber = myAcctNumber.toString();
	/* We need to pad myAcctNumber so that it's exactly 8 characters long. So we create a loop which will fill up myAcctNumber with 0s from the left until it's 8 characters long.
	 * So 1 becomes 00000001, 1522 becomes 00001522, etc.
	 * Strings also have a .length method (like Arrays) which lets us know how many characters long a string is. */
	while (myAcctNumber.length<8) {
	    /* Add a "0" character to the left of the string. */
	    myAcctNumber = '0'+myAcctNumber;
	}
	/* We create a bank account no. with a prefix "20172019-", so that a bank account number would look like eg. "20172019-00001522". So we add this prefix to myAcctNumber. */
	myAcctNumber = '20172019-'+myAcctNumber;
	/* NOW we create a new instance of bankAccount, so a new bankAccount object is created in a blank state.
	 * When we call new className(...), the className.constructor instance method is automatically run, which let us initialize the object.
	 * Check out the constructor() method at the beginning of this class for an example.
	 * The new object will be accessible under the temporary variable newAcct.
	 * While this actual variable will be discarded at the end of this static method, by that time the new bankAccount object will be stored in the bankAccount.accounts named array.
	 * Since Objects are stored by reference, losing the newAcct reference while having a new one in bankAccount.accounts will keep the new object around. */
	let newAcct = new bankAccount();
	/* We fill out the account details according to the arguments of this static method:
	 * - createAccount(ownerName,birthDate,mothersMaidenName)
	 * The argument variables will be accessed here and their values used to populate the corresponding fields in the new bankAccount object. */
	newAcct.ownerName = ownerName;
	newAcct.ownerBirthdate = birthDate;
	newAcct.ownerMMName = mothersMaidenName;
	newAcct.accountNumber = myAcctNumber;
	/* We call the static method bankAccount.commonName(...) to create a "common name" from the bank account owner's name. */
	newAcct.ownerCommonName = bankAccount.commonName(ownerName);
	/* VERY IMPORTANT! Now we store the newly created account in the bankAccount.accounts named array.
	 * The storage key will be the account number. */
	bankAccount.accounts[myAcctNumber] = newAcct;
	/* However, we should also create a system where an account can be looked up by the owner's name.
	 * So, using the commonName'd version of the name, we also create a key in the named array.
	 * BUT! Since a name is not as unique as an account number, ie. two or more people with identical names might have accounts here (cf John Smith), we have to assume
	 * that multiple bank accounts might be connected to the same name (and maybe the same owner can have multiple accounts too).
	 * So under owner name-based keys, we do not store straight references to bankAccount objects, but we store an Array that contains the actual references to the objects. */
	/* First we check if there is any bank account already under the current name. */
	if (typeof bankAccount.accounts[newAcct.ownerCommonName]==='undefined') {
	    /* If not, then this is the first time anyone has made a bank account under this name, so we need to create the initial empty array.
	     * For this, we use the array literal notation, which is [] for an empty array, or [item1,item2,...] for an already populated array. */
	    bankAccount.accounts[newAcct.ownerCommonName] = [];
	}
	/* And now we can push the bankAccount object reference into that array under the owner name-based key, as in the previous conditional branch we made sure that the array exists.
	 * If the array existed before, we can just safely push another value into it. */
	bankAccount.accounts[newAcct.ownerCommonName].push(newAcct);
	/* Finally, we return the new bankAccount object as the return value. */
	return newAcct;
    }
    /**
     * Return an array of bank accounts whose owner is searchName or it contains searchName.
     * @param {String} searchName
     * @returns {Array}
     */
    static getAccountByName(searchName) {
	searchName = searchName.toLocaleLowerCase();
	if (typeof bankAccount.accounts[searchName]!=='undefined') {
	    return bankAccount.accounts[searchName].slice();
	}
	let result = [];
	let names = Object.keys(bankAccount.accounts);
	names = names.filter(function(nam) {
	    return nam.substr(0,8)!=='20172019';
	});
	for(let i=0;i<names.length;i++) {
	    if (names[i].indexOf(searchName)>-1) {
		result = result.concat(bankAccount.accounts[names[i]]);
	    }
	}
	return result;
    }
    /**
     * Return a bankAccount by its account number.
     * @param {String} searchNum
     * @returns {bankAccount|null}
     */
    static getAccountByNumber(searchNum) {
	if (typeof bankAccount.accounts[searchNum]!=='undefined') {
	    return bankAccount.accounts[searchNum];
	}
	else if (typeof bankAccount.accounts['20172019-'+searchNum]!=='undefined') {
	    return bankAccount.accounts['20172019-'+searchNum];
	}
	else {
	    return null;
	}
    }
    /**
     * Remove an account from the accounts directory.
     * @param {String} nameOrAcctNo
     * @returns {bankAccount} the removed account
     */
    static removeAccount(nameOrAcctNo) {
	/** @type {bankAccount} */
	let thisAcct = null;
	if (nameOrAcctNo.substr(0,8)==='20172019') {
	    thisAcct = bankAccount.getAccountByNumber(nameOrAcctNo);
	}
	else {
	    let results = bankAccount.getAccountByName(nameOrAcctNo);
	    if (results.length>1) {
		let err = new bankAccountMultipleNameException("multiple names, choose");
		err.setAccountList(results);
		throw err;
	    } 
	    else if (results.length===1) {
		thisAcct = results[0];
	    }
	}
	if (thisAcct===null) {
	    throw new Error('account not found');
	}
	delete bankAccount.accounts[thisAcct.accountNumber];
	bankAccount.accounts[thisAcct.ownerCommonName] = bankAccount.accounts[thisAcct.ownerCommonName].filter(function(item) {
	    return item!==thisAcct;
	});
	if (bankAccount.accounts[thisAcct.ownerCommonName].length===0) {
	    delete bankAccount.accounts[thisAcct.ownerCommonName];
	}
	return thisAcct;
    }
    /**
     * Return a unique transaction ID, automatically generated.
     * @returns {String}
     */
    static createTransactionId() {
	let nt = new Date().getTime();
	return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '-' + nt.toString();
    }
    /**
     * Transfer funds between accounts.
     * @param {String|bankAccount} sender either as a bankAccount object, or an account number
     * @param {String|bankAccount} recipient either as a bankAccount object, or an account number
     * @param {Number} amount to transfer
     * @param {String} remark additional remark
     * @returns {String}
     */
    static transfer(sender,recipient,amount,remark) {
	if (typeof sender!=='object') {
	    sender = bankAccount.getAccountByNumber(sender);
	}
	if (typeof recipient!=='object') {
	    recipient = bankAccount.getAccountByNumber(recipient);
	}
	if (sender===null || recipient===null || typeof sender['ownerName']==='undefined' || typeof recipient['ownerName']==='undefined') {
	    throw new Error('sender or recipient not found');
	}
	if (sender.balance-amount < 0) {
	    throw new Error('sender does not have enough funds');
	}
	let trid = bankAccount.createTransactionId();
	sender.changeBalance(-1*amount,recipient.ownerName+'@'+recipient.accountNumber,trid,remark);
	recipient.changeBalance(amount,sender.ownerName+'@'+sender.accountNumber,trid,remark);
	return trid;
    }
    /**
     * Psst.
     * @returns {bankAccount[]}
     */
    static getAccountsAsArray() {
	/* Object.keys(myObject) will give you all the named array-like keys from the object myObject. The keys are returned as an array of strings.
	 * Check for https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
	 * The names variable will be an array of the keys from the named array bankAccount.accounts.
	 * However, it will contain both account number-based keys and owner name-based keys, so we will have to deal with that. */
	let names = Object.keys(bankAccount.accounts);
	/* Here we make use of the Array method .filter, which runs through the items of the array, and using a custom filtering function, returns an array of filtered elements.
	 * Check for https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
	 * myArray.filter takes a function as an argument. This function receives the current item in the array (as the .filter goes through each),
	 * and it has to return true if the item is deemed to pass the filter condition and should remain in the output array, or false if not. */
	names = names.filter(function(nam) {
	    /* We return a comparison expression directly which should evaluate to true or false.
	     * In this case, it will return true if the first 8 characters of the array item (in this case, the key we're examining) looks like
	     * an account number's first 8 digits (which is pre-set, cf. bankAccount.createAccount() ).
	     * This way, we will only keep the keys which lead directly to bankAccount objects, as this is our aim. */
	    return nam.substr(0,8)==='20172019';
	});
	/* Once the filtering is done, we need to create an output array that will store the bankAccount objects. We create that here. */
	let result = [];
	/* We iterate through the names array, which by now should only hold the keys which are account numbers, and which in turn will lead us to the bankAccount objects we need. */
	for(let i=0;i<names.length;i++) {
	    /* Push the bankAccount object at bankAccount.accounts[names[i]] into the output array, result.
	     * Mind here the format of the reference. When there are multiple []s and ()s and {}s, if you want to resolve where they actually point to, always start at the innermost.
	     * In this example, let's analyze bankAccount.accounts[names[i]]:
	     * - [i] is the innermost reference. i is the loop variable here, which tells us which item in the names array we're inspecing.
	     * - names[i] therefore will point to an item in the names array, namely the i'th item.
	     * - names[i] will be then a ke y from bankAccount.accounts (cf the first line of this static method), that is certain to be an account number (cf the names.filter part).
	     * - since we know that account number-based keys in the bankAccount.accounts named array will point to actual bankAccount objects, we can use this key to get a bankAccount object.
	     * - bankAccount.accounts[names[i]] will then point to the bankAccount object that has the account number that matches names[i].
	     * - So for example if there is a bank account with the number "20172019-00000001", it will have a corresponding key in bankAccount.accounts.
	     * - bankAccount.accounts["20172019-00000001"] will point to this bankAccount object.
	     * - If we have a variable that contains the string "20172019-00000001", and we call that variable acctNum, then 
	     *   - bankAccount.accounts["20172019-00000001"] and
	     *   - bankAccount.accounts[acctNum]
	     *   will point to the same bankAccount object.
	     * - We use the above rules here. */
	    result.push(bankAccount.accounts[names[i]]);
	}
	/* Once done, we have the output array, and we return that array as a return value. */
	return result;
    }
    /**
     * Return the total capital of the bank at the current moment.
     * 
     * The total capital is counted by adding up the balances of individual accounts.
     * 
     * TODO
     * 
     * @returns {Number}
     */
    static totalCapital() {
	let countedCapital = 0;
        /* let numbersOfAccount = Object.keys(bankAccount.accounts);
        numbersOfAccount = numbersOfAccount.filter(function(name) {
            return name.substr(0,8)==='20172019';
        });
	for (let i=0; i<numbersOfAccount.length; ++i) {
            countedCapital += bankAccount.accounts[numbersOfAccount[i]].balance; 
        }
	return countedCapital; */
        let numbersOfAccount2 = bankAccount.getAccountsAsArray();
        for (let i=0; i<numbersOfAccount2.length; ++i); {
            countedCapital += numbersOfAccount2[i]["balance"];
        }
        return countedCapital;
    }
    /**
     * Return an array containing all accounts showing their number, their owner's name and the current balance.
     * 
     * console.log should show:
     * [
     *  { accountNumber: '<ACCOUNT NUMBER>',
     *    owner: '<ACCOUNT OWNER>',
     *    balance: <CURRENT_BALANCE> },
     *  { accountNumber: ...etc } ]
     * 
     * TODO
     * 
     * @returns {Array}
     */
    static currentLedger() {
	let results = [];
        let numbersOfAccount = bankAccount.getAccountsAsArray();
        for (let i=0; i<numbersOfAccount.length; ++i) {
            results.push({
               "accountNumber": numbersOfAccount[i]["accountNumber"].toString(),
               "owner": numbersOfAccount[i]["ownerName"].toString(),
               "balance": numbersOfAccount[i]["balance"].toString()
            });
        }
        // creatate a varibble that .getAccountAsArray
        // create objects and then push it into the array
        // create a for loop and work on the created variable
      
     return results;   
    }
}

let centralAcct = bankAccount.createAccount("CENTRAL BANK ACCOUNT","2018-02-16","-").changeBalance(10000000,"Mafia Plc",bankAccount.createTransactionId(),"initial funds");
let BandisAccount = bankAccount.createAccount("KEMÉNY ANDRÁS ISTVÁN","1975-02-15","psst secret").changeBalance(50000,"ATM03223",bankAccount.createTransactionId(),"cash deposit");
centralAcct.transferTo(BandisAccount,150000,"money laundering, psst, dont tell the fbi or the irs");
bankAccount.transfer(centralAcct,BandisAccount,150000,"some more money laundering");

//console.log(BandisAccount.history);
//console.log(centralAcct.history);

/*
 * These are your homework tasks' outputs.
 */
console.log(bankAccount.totalCapital());
console.log(bankAccount.currentLedger());

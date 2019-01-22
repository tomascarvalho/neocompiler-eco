function addLocalPrivateNet(){
  const config = {
    name: 'LocalPrivateNet',
    extra: {
      neoscan: getFirstAvailableService("neoscan",localHostNodes) + "/api/main_net"
    }
  }
  const localprivateNet = new Neon.rpc.Network(config)
  Neon.default.add.network(localprivateNet)
  console.log(Neon.settings.networks['LocalPrivateNet'])
}

function addSharedPrivateNet(){
  const config = {
    name: 'SharedPrivateNet',
    extra: {
      neoscan: getFirstAvailableService("neoscan",ecoNodes) + "/api/main_net"
    }
  }
  const sharedprivateNet = new Neon.rpc.Network(config)
  Neon.default.add.network(sharedprivateNet)
  console.log(Neon.settings.networks['SharedPrivateNet'])
}


//createGenesisTransaction("AZ81H31DMWzbSnFDLFkzh9vHwaDLayV7fU",BASE_PATH_CLI, getCurrentNetworkNickname());
// const balance = Neon.api.neoscan.getBalance(getCurrentNetworkNickname(),"AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y")

function getNRequiredSignatures(verificationScript){
    	nextPKeyIndex = verificationScript.indexOf(21);

	//Consider 52 is 2 signatures, 53 is 3, 511 would be 11 (TODO CHECK WITH IGOR)
	nRequiredSignatures = verificationScript.substr(1,nextPKeyIndex-1);
	return nRequiredSignatures;
}

function getPubKeysFromMultiSig(verificationScript)
{
	nRequiredSignatures = getNRequiredSignatures(verificationScript);
        jssonArrayWithPubKey = [];

    	nextPKeyIndex = verificationScript.indexOf(21);
	while(nextPKeyIndex != -1)
	{
		pKeyNBytes=33;
		//get the pKeyNBytes opcodes
		nextPKey = verificationScript.substr(nextPKeyIndex+2,pKeyNBytes*2)
        	jssonArrayWithPubKey.push({pubKey: nextPKey});

		verificationScript = verificationScript.substr(pKeyNBytes*2 + nextPKeyIndex+2);
		nextPKeyIndex = verificationScript.indexOf(21);
        }

	//console.log(verificationScript);
	nObtainedSignatures = jssonArrayWithPubKey.length.toLocaleString();
	//get number of signatures - jump 5 and get number
	nSignatures = verificationScript.substr(1, nObtainedSignatures.length)
	if(nSignatures != nObtainedSignatures)
		alert("Error on number of signatures at getPubKeysFromMultiSig!");

	//console.log(arrayPubKey);
	return jssonArrayWithPubKey;
}

function getAddressBase58FromMultiSig(verificationScript)
{
	jssonArrayWithAddr = [];
	jssonArrayWithPubKey = getPubKeysFromMultiSig(verificationScript);
	for(a=0;a<jssonArrayWithPubKey.length;a++)
		jssonArrayWithAddr.push({addressBase58: toBase58FromPublicKey(jssonArrayWithPubKey[a].pubKey)});
	return jssonArrayWithAddr;
}


function sortMultiSigInvocationScript(wtx,invocationScript, verificationScript){
        arrayPubKey = getPubKeysFromMultiSig(verificationScript);
	jsonWithOrderedSignatures = [];

	for(a=0;a<arrayPubKey.length;a++)
	{
		currentInvocationScript = invocationScript;
		nextSignatureIndex = currentInvocationScript.indexOf(40);
		while(nextSignatureIndex != -1)
		{
			signatureNBytes=64;
			nextSignature = currentInvocationScript.substr(nextSignatureIndex+2,signatureNBytes*2);
			currentInvocationScript = currentInvocationScript.substr(signatureNBytes*2 + nextSignatureIndex+2);

			console.log(nextSignature);
			if(Neon.wallet.verifySignature(wtx, nextSignature, arrayPubKey[a].pubKey))
			{
				jsonWithOrderedSignatures.push({privKey: nextSignature});
				break;//exit while
			}
			nextSignatureIndex = currentInvocationScript.indexOf(40);
		}
	}

	console.log(jsonWithOrderedSignatures);

	//=====================================================
	//========= Delete any exceding number of signatures ==
	nRequiredSignatures = getNRequiredSignatures(verificationScript);
	if(jsonWithOrderedSignatures.length > nRequiredSignatures)
	{
		console.log("Deleting excedding signatures  " + jsonWithOrderedSignatures.length + "/" + nRequiredSignatures);
		signaturesToDelete = jsonWithOrderedSignatures.length - nRequiredSignatures;
		for(d=0;d<signaturesToDelete;d++)
			delete jsonWithOrderedSignatures.splice(d, 1);

		console.log(jsonWithOrderedSignatures);
	}else{
		if(jsonWithOrderedSignatures.length < nRequiredSignatures)
		{
			console.log("Missings signatures  " + jsonWithOrderedSignatures.length + "/" + nRequiredSignatures);
		}
	}
	//=====================================================

	//=====================================================
	finalIS = "";
	for(a=0;a<jsonWithOrderedSignatures.length;a++)
		finalIS += "40" + jsonWithOrderedSignatures[a].privKey;
	//=====================================================

	//Neon.wallet.verifySignature(wtx, signature, pubKeyOfSigner)
	return finalIS;
}

function signWithMultiSign(wtx, currentInvocationScript, privateKeyOfSigner){
 	//pubKeyOfSigner = Neon.default.get.publicKeyFromPrivateKey(privateKeyOfSigner);
	//console.log(pubKeyOfSigner);

	var signature = Neon.wallet.generateSignature(wtx, privateKeyOfSigner);
	currentInvocationScript += "40" + signature;

        //VerifySignature
        //console.log(Neon.wallet.verifySignature(wtx, signature, pubKeyOfSigner))

	return currentInvocationScript;
}

function getContractState(contractScriptHash, deployOrInvoke){
            console.log("formating as json for RPC request...");
            requestJson = "{ \"jsonrpc\": \"2.0\", \"id\": 5, \"method\": \"getcontractstate\", \"params\": [\""+contractScriptHash+"\"] }";
            console.log(requestJson);

            console.log("SENDING TO"+BASE_PATH_CLI);
            $.post(
                BASE_PATH_CLI, // Gets the URL to sent the post to
                requestJson, // Serializes form data in standard format
                function (resultJsonData) {
                   console.log(resultJsonData);
                   if(resultJsonData.result)
                   {
			if(deployOrInvoke)
			   	createNotificationOrAlert("DEPLOYING A CONTRACT THAT ALREADY EXISTS", "code_version: " + resultJsonData.result.code_version +  " name:" + resultJsonData.result.name, 3000);
		   }else{
			if(!deployOrInvoke)
				createNotificationOrAlert("INVOKING WITH CONTRACT NOT YET FOUND", "CODE: " + resultJsonData.error.code +  " Reason:" + resultJsonData.error.message, 3000);
		   }
                },
                "json" // The format the response should be in
            ).fail(function() {
		createNotificationOrAlert("CONTRACT STATE", "failed to pass request to RPC network!", 3000);
            }); //End of POST for search
}


function sendRawTXToTheRPCNetwork(wtx){
            console.log("formating as json for RPC request...");
            wtxjson = "{ \"jsonrpc\": \"2.0\", \"id\": 5, \"method\": \"sendrawtransaction\", \"params\": [\""+wtx+"\"] }";
            console.log(wtxjson);

            console.log("SENDING TO"+BASE_PATH_CLI);
            $.post(
                BASE_PATH_CLI, // Gets the URL to sent the post to
                wtxjson, // Serializes form data in standard format
                function (resultJsonData) {
                   console.log(resultJsonData);
                   if(resultJsonData.result)
                   {
			   if(typeof(resultJsonData.result) == "boolean") // 2.X
		  		createNotificationOrAlert("RPCRawTX", resultJsonData.result, 5000);
			   else // 3.X
		   		createNotificationOrAlert("RPCRawTX", "Status: " + resultJsonData.result.succeed +  " Reason:" + resultJsonData.result.reason, 5000);
		   }else
			createNotificationOrAlert("RPCRawTX", "ERROR: " + resultJsonData.error.code +  " Reason:" + resultJsonData.error.message, 5000);
                },
                "json" // The format the response should be in
            ).fail(function() {
		createNotificationOrAlert("RPCRawTX", "failed to pass transaction to network!", 5000);
            }); //End of POST for search
}

function getMultiSigPrivateKeys(multiSigIndex){
            jsonArrayWithPrivKeys = [];
	    if(KNOWN_ADDRESSES[multiSigIndex].type === "multisig")
	    {
		for(o=0;o<KNOWN_ADDRESSES[multiSigIndex].owners.length;o++)
		{
			privateKeyToGet = getWifIfKnownAddress(KNOWN_ADDRESSES[multiSigIndex].owners[o].addressBase58);
			if(privateKeyToGet!=-1)
				jsonArrayWithPrivKeys.push({privKey: privateKeyToGet});
		}
	    }else
		alert("Index" + multiSigIndex + " is not a multisig address! getMultiSigPrivateKeys");

	   return jsonArrayWithPrivKeys;
}


//==========================================================================
//Call for Genesis Block
//genesisBlockTransfer("AZ81H31DMWzbSnFDLFkzh9vHwaDLayV7fU","AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y");
function genesisBlockTransfer(genesisAddress, newOwner){
	//console.log("Inside Genesis Block Transfers");
	//Verification on the front-end if wallets already have funds, then, skip transfer
	//console.log("newOwnerIndex: " + searchAddrIndexFromBase58(newOwner));
	newOwnerNeoBalance = $("#walletNeo" + searchAddrIndexFromBase58(newOwner)).val();
	newOwnerGasBalance = $("#walletGas" + searchAddrIndexFromBase58(newOwner)).val();
	//console.log("newOwnerNEO with address: " + newOwner + " balance is: " + newOwnerNeoBalance);
	//console.log("newOwnerGAS with address: " + newOwner + " balance is: " + newOwnerGasBalance);
	if( (newOwnerNeoBalance > 0) && (newOwnerGasBalance > 0))
	{
		clearInterval(refreshGenesisBlock);
	}
	else
	{
		if(!(newOwnerNeoBalance > 0))
			getAllNeoOrGasFrom(genesisAddress,"NEO","",true,newOwner);

		if(!(newOwnerGasBalance > 0))
			getAllNeoOrGasFrom(genesisAddress,"GAS","",true,newOwner);
	}

	//var genesisAddressIndex = searchAddrIndexFromBase58(genesisAddress);
	//var jsonArrayWithPrivKeys = getMultiSigPrivateKeys(genesisAddressIndex);

	//createMultiSigSendingTransaction(KNOWN_ADDRESSES[4].verificationScript, jsonArrayWithPrivKeys, newOwner, 100000000, "NEO", getCurrentNetworkNickname());
	//getAllNeoOrGasFrom("AZ81H31DMWzbSnFDLFkzh9vHwaDLayV7fU","GAS","",true,"AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y");
	//getAllNeoOrGasFrom("AZ81H31DMWzbSnFDLFkzh9vHwaDLayV7fU","NEO","",true,"AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y");
	//createMultiSigSendingTransaction(KNOWN_ADDRESSES[4].verificationScript, jsonArrayWithPrivKeys, newOwner, allGas, "GAS", getCurrentNetworkNickname());

	//Claim will be automatic if frontend is open
	//createMultiSigClaimingTransaction(KNOWN_ADDRESSES[4].verificationScript, jsonArrayWithPrivKeys, getCurrentNetworkNickname());
}
//==========================================================================

function createMultiSigClaimingTransaction(verificationScript,jsonArrayWithPrivKeys,networkToCall){
	addressBase58 = toBase58(getScriptHashFromAVM(verificationScript));
	const config = {
	  net: networkToCall,
	  address: addressBase58
	}

	claimsFrom = Neon.api.getClaimsFrom(config, Neon.api.neoscan)
	claimsFrom.then((c) => Neon.api.createTx(c, 'claim'))
	claimsFrom.then( function(c) {
		c.tx.scripts = [];
		//Everyone signs the invocation in any order
		var invocationScript = '';
		for(nA=0;nA<jsonArrayWithPrivKeys.length;nA++)
			invocationScript = signWithMultiSign(c.tx.serialize(), invocationScript, Neon.default.get.privateKeyFromWIF(jsonArrayWithPrivKeys[nA].privKey));

		invocationScript = sortMultiSigInvocationScript(c.tx.serialize(),invocationScript, verificationScript);
		c.tx.scripts.push({invocationScript: invocationScript, verificationScript: verificationScript});
		const serializedTx = c.tx.serialize();
		console.log(serializedTx);
		sendRawTXToTheRPCNetwork(serializedTx);
	});
}

//==========================================================================
function createGasAndNeoIntent(to, neo, gas){
    var intent;
    if(neo > 0 && gas > 0)
        intent = Neon.api.makeIntent({NEO:neo,GAS:gas}, to)

    if(neo == 0 && gas > 0)
        intent = Neon.api.makeIntent({GAS:gas}, to)

    if(neo > 0 && gas == 0)
        intent = Neon.api.makeIntent({NEO:neo}, to)
    return intent;
}
//==========================================================================

//==========================================================================
function createMultiSigSendingTransaction(verificationScript, jsonArrayWithPrivKeys, to, neo, gas, networkToCall){
	addressBase58 = toBase58(getScriptHashFromAVM(verificationScript));
	Neon.api.neoscan.getBalance(networkToCall,addressBase58)
	.then(balance => {
		let tx = Neon.default.create.tx({type: 128})
		// Now let us add an intention to send 1 NEO to someone
		if(neo > 0)
			tx.addOutput("NEO",neo,to)

		if(gas > 0)
			tx.addOutput("GAS",gas,to)
		tx.calculate(balance)
		//.addRemark('I all Neo from the Genesis CN wallet') // Add an remark
		//tx.inputs = [];
		//Asset Issue Genesis Transaction, done when CN are firstly initialized: 7aadf91ca8ac1e2c323c025a7e492bee2dd90c783b86ebfc3b18db66b530a76d
		//tx.inputs.push({prevHash: "7aadf91ca8ac1e2c323c025a7e492bee2dd90c783b86ebfc3b18db66b530a76d", prevIndex: 0})
		console.log(tx)
		tx.scripts = [];
		//Only one verification is needed - All are the same for a Multi-Sig address
		// 5, 7, 4 6
		//Everyone signs the invocation in any order
		var invocationScript = '';
		for(nA=0;nA<jsonArrayWithPrivKeys.length;nA++)
			invocationScript = signWithMultiSign(tx.serialize(), invocationScript, Neon.default.get.privateKeyFromWIF(jsonArrayWithPrivKeys[nA].privKey));

		console.log(invocationScript);
		invocationScript = sortMultiSigInvocationScript(tx.serialize(),invocationScript, verificationScript);
		tx.scripts.push({invocationScript: invocationScript, verificationScript: verificationScript})
		const serializedTx = tx.serialize();
		console.log(serializedTx);
		sendRawTXToTheRPCNetwork(serializedTx);
	});
}
//==========================================================================


function CreateTx( from, fromPrivateKey, to, neo, gas, nodeToCall, networkToCall, sendingFromSCFlag = false){
    //balance = Neon.api.neoscan.getBalance('PrivateNet', from).then(res => console.log(res))
    var intent = createGasAndNeoIntent(to, neo, gas);

    console.log(intent) // This is an array of 2 Intent objects, one for each asset
    const config = {
        net: networkToCall, // The network to perform the action, MainNet or TestNet.
        url: nodeToCall,
        address: from,  // This is the address which the assets come from.
	sendingFromSmartContract: sendingFromSCFlag,
        privateKey: fromPrivateKey,
        intents: intent
    }

    Neon.default.sendAsset(config)
    .then(res => {
        //console.log("network:"+networkToCall);
        console.log(res.response);
        if(typeof(res.response.result) == "boolean") // 2.X
           createNotificationOrAlert("SendTX", res.response.result, 5000);
        else // 3.X
           createNotificationOrAlert("SendTX", "Status: " + res.response.result.succeed +  " Reason:" + res.response.result.reason, 5000);
    })
    .catch(e => {
        createNotificationOrAlert("SendTX", "Transfer transaction has failed!", 5000);
        console.log(e)
    })
}

//Private key or signing Function
function createClaimGasTX( from, fromPrivateKey, nodeToCall, networkToCall){
    const config = {
        net: networkToCall, // The network to perform the action, MainNet or TestNet.
        url: nodeToCall,
        address: from,  // This is the address which the assets come from.
        privateKey: fromPrivateKey,
    }

    //https://github.com/CityOfZion/neon-js/blob/6086ef5f601eb934593b0a0351ea763535298aa8/src/api/core.js#L38
    //https://github.com/CityOfZion/neon-js/blob/c6a169a82a4d037e00dccd424f53cdc818d6b3ae/src/transactions/transaction.js#L80
    //https://github.com/CityOfZion/neon-js/blob/fe588b7312cad90f20c4febe0e3f24d93b43ab20/src/wallet/Account.js#L19

    Neon.default.claimGas(config)
    .then(res => {
        //console.log("network:"+networkToCall);
        console.log(res.response)
        if(typeof(res.response.result) == "boolean") // 2.X
           createNotificationOrAlert("ClaimTX", res.response.result, 5000);
        else // 3.X
           createNotificationOrAlert("ClaimTX", "Status: " + res.response.result.succeed + " Reason:" + res.response.result.reason, 5000);
    })
    .catch(e => {
        createNotificationOrAlert("ClaimTX", "Claim transaction has failed!", 5000);
        console.log(e)
    })
}

//ICO TEMPLATE EXAMPLE:
/*
//Invoke mintToken from wallet of AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y
Invoke(KNOWN_ADDRESSES[0].addressBase58,KNOWN_ADDRESSES[0].pKeyWif,0,10,0, "e096710ef8012b83677b039ec0ee6871868bfcf9", "mintTokens", BASE_PATH_CLI, getCurrentNetworkNickname(), [])

//Check Balance of AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y
{
  "jsonrpc": "2.0",
  "method": "invokefunction",
  "params": [
    "e096710ef8012b83677b039ec0ee6871868bfcf9",
    "balanceOf",
    [
      {
        "type": "Hash160",
        "value": "e9eed8dc39332032dc22e5d6e86332c50327ba23"
      }
    ]
  ],
  "id": 3
}

//Transfer some NEP-5 Tokens from AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y to APLJBPhtRg2XLhtpxEHd6aRNL7YSLGH2ZL
var neonJSParams = [];
pushParams(neonJSParams, 'Address', 'AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y');
pushParams(neonJSParams, 'Address', 'APLJBPhtRg2XLhtpxEHd6aRNL7YSLGH2ZL');
pushParams(neonJSParams, 'Integer', "0.5");
Invoke(KNOWN_ADDRESSES[0].addressBase58,KNOWN_ADDRESSES[0].pKeyWif,0,0,0, "925705cf2cae08804c51e2feaaa0f0a3c7b77bb9", "Transfer", BASE_PATH_CLI, getCurrentNetworkNickname(), neonJSParams)

//Check Balance of APLJBPhtRg2XLhtpxEHd6aRNL7YSLGH2ZL
{
  "jsonrpc": "2.0",
  "method": "invokefunction",
  "params": [
    "e096710ef8012b83677b039ec0ee6871868bfcf9",
    "balanceOf",
    [
      {
        "type": "Hash160",
        "value": "0f2b7a6ee34db32d9151c6028960ab2a8babea52"
      }
    ]
  ],
  "id": 3
}

*/

function pushParams(neonJSParams, type, value){
	if(type == 'String')
		neonJSParams.push(Neon.default.create.contractParam(type, value));
	else if(type == 'Address')
		neonJSParams.push(Neon.sc.ContractParam.byteArray(value, 'address'));
	else if(type == 'Hex')
		neonJSParams.push(Neon.default.create.contractParam('ByteArray', value));
	else if(type == 'DecFixed8') {
         // Decimal fixed 8 seems to break at transition 92233720368.54775807 -> 92233720368.54775808
   		neonJSParams.push(Neon.sc.ContractParam.byteArray(value, 'fixed8'));
         }
	else if(type == 'Integer') {
	      if((typeof(value) == "string") && (Number(value).toString() != value))
		 value = "0"; // imprecision in javascript? // JAVASCRIPT MAXIMUM NUMBER SEEMS TO BE: 9223372036854775000
	      if(Number(value) < 0) // neon-js int conversion will fail for negative values: "expected hexstring but found..."
		 neonJSParams.push(Neon.default.create.contractParam('ByteArray', negbigint2behex(value)));
	      else
	   	 neonJSParams.push(Neon.default.create.contractParam('Integer', Number(value)));
      //console.log("INTEGER="+value+" -> "+Number(value));
        }
   	else if(type == 'Array')
      		neonJSParams.push(Neon.default.create.contractParam(type, value));
	else
		alert("You are trying to push a wrong invoke param type: " + type + "with value : " + value);
}

//Example of invoke
//Invoke(KNOWN_ADDRESSES[0].addressBase58,KNOWN_ADDRESSES[0].pKeyWif,3,1,1, "24f232ce7c5ff91b9b9384e32f4fd5038742952f", "operation", BASE_PATH_CLI, getCurrentNetworkNickname(), [])

function myAsyncFunction(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = () => resolve(xhr.responseText);
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send();
  });
}


function Invoke(myaddress, myprivatekey, mygasfee, neo, gas, contract_scripthash, contract_operation, nodeToCall, networkToCall, neonJSParams, callback, testCase){
    return new Promise((resolve, reject) => {
        console.log("Invoke '" + contract_scripthash + "' function '" + contract_operation + "' with params '" + neonJSParams+"'");

        var i = 0;
        for(i = 0; i<neonJSParams.length; i++)
            console.log(JSON.stringify(neonJSParams[i]));

        console.log("mygasfee '" +mygasfee+ "' neo '" + neo + "' gas '" + gas+"'");

        //Notify user if contract exists
        getContractState(contract_scripthash, false);
        if(contract_scripthash == "" || !Neon.default.is.scriptHash(contract_scripthash)) {
            alert("Contract scripthash " + contract_scripthash + " is not being recognized as a scripthash.");
            return;
        }

        var intent;
        if(neo > 0 && gas > 0)
        	intent = Neon.api.makeIntent({NEO:neo,GAS:gas}, toBase58(contract_scripthash))

        if(neo == 0 && gas > 0)
        	intent = Neon.api.makeIntent({GAS:gas}, toBase58(contract_scripthash))

        if(neo > 0 && gas == 0)
        	intent = Neon.api.makeIntent({NEO:neo}, toBase58(contract_scripthash))

        //console.log(intent);

        /*
        export const createScript = (...scriptIntents) => {
        if (scriptIntents.length === 1 && Array.isArray(scriptIntents[0])) {
        scriptIntents = scriptIntents[0]
        }
        const sb = new ScriptBuilder()
        for (var scriptIntent of scriptIntents) {
        if (!scriptIntent.scriptHash) throw new Error('No scriptHash found!')
        const { scriptHash, operation, args, useTailCall } = Object.assign({ operation: null, args: undefined, useTailCall: false }, scriptIntent)

        sb.emitAppCall(scriptHash, operation, args, useTailCall)
        }
        return sb.str
        }

        emitAppCall (scriptHash, operation = null, args = undefined, useTailCall = false) {
        this.emitPush(args)
        if (operation) {
        let hexOp = ''
        for (let i = 0; i < operation.length; i++) {
          hexOp += num2hexstring(operation.charCodeAt(i))
        }
        this.emitPush(hexOp)
        }
        this._emitAppCall(scriptHash, useTailCall)
        return this
        }
        */

        var sb = Neon.default.create.scriptBuilder();//new ScriptBuilder();
        var i=0;
        // PUSH parameters BACKWARDS!!
        for(i=neonJSParams.length-1; i>=0; i--) {
             console.log('emit push:'+JSON.stringify(neonJSParams[i]));
             console.log(neonJSParams[i]);
             if (Array.isArray(neonJSParams[i])) {
                 console.log("is array!");
                 //sb._emitArray(neonJSParams[i]);
             }
             //else
             //      sb.emitPush(neonJSParams[i]);
             sb._emitParam(neonJSParams[i]);
        }
        sb._emitAppCall(contract_scripthash, false); // tailCall = false
        var myscript = sb.str;

        // TODO: consider "in array" option to create an array of parameters...
        // Json should be something like: [{"type":"String","value":"op"},[{"type":"String","value":"ccxxcx"},{"type":"String","value":"sddsdd"}]]
        // Or: [{"type":"String","value":"op"},{"type":"Array", "value": [{"type":"String","value":"ccxxcx"},{"type":"String","value":"sddsdd"}]}]


        const config = {
        net: networkToCall,
        url: nodeToCall,
        //script: Neon.default.create.script({
        //   scriptHash: contract_scripthash,
        //   operation: contract_operation,
        //   args: neonJSParams
        // }),
        script : myscript, // new manual script respecting each parameter
        intents: intent,
        address: myaddress, //'AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y',//'ARCvt1d5qAGzcHqJCWA2MxvhTLQDb9dvjQ',
        privateKey: myprivatekey, //'1dd37fba80fec4e6a6f13fd708d8dcb3b29def768017052f6c930fa1c5d90bbb',//'4f0d41eda93941d106d4a26cc90b4b4fddc0e03b396ac94eb439c5d9e0cd6548',
        gas: mygasfee //0
        }

        Neon.default.doInvoke(config).then(res => {
            console.log(res);
            //console.log(res.tx.hash);

            if(typeof(res.response.result) == "boolean") // 2.X
                 createNotificationOrAlert("Invoke","Response: " + res.response.result + " of " + contract_scripthash, 7000);
            else // 3.X
                 createNotificationOrAlert("Invoke","Response: " + res.response.result.succeed + " Reason:" + res.response.result.reason + " of " + contract_scripthash + " id " + res.tx.hash, 7000);

            if(res.response.result) {
              if(typeof(res.response.result) == "boolean") { // 2.X
                  updateVecRelayedTXsAndDraw(res.response.txid,"Invoke",contract_scripthash,JSON.stringify(neonJSParams));
                  $("#transactionHash").val(res.response.txid);
                  callback(testCase, res.response.txid, res.tx.gas);
              }
              else { // 3.X
            	  updateVecRelayedTXsAndDraw(res.tx.hash,"Invoke",contract_scripthash,JSON.stringify(neonJSParams));
                  $("#transactionHash").val(res.response.hash);
                  callback(testCase, res.response.txid, res.tx.gas);
              }
            }

            

        }).catch(err => {
         console.log(err);
         createNotificationOrAlert("Invoke ERROR","Response: " + err, 7000);
        });

        document.getElementById('divNetworkRelayed').scrollIntoView();

    });
}


//Example of Deploy checkwitness
//Deploy(KNOWN_ADDRESSES[0].addressBase58,KNOWN_ADDRESSES[0].pKeyWif,90,BASE_PATH_CLI, getCurrentNetworkNickname(),script,false,01,'')
//Deploy(KNOWN_ADDRESSES[0].addressBase58,KNOWN_ADDRESSES[0].pKeyWif,500,BASE_PATH_CLI, getCurrentNetworkNickname(),'00c56b611423ba2703c53263e8d6e522dc32203339dcd8eee96168184e656f2e52756e74696d652e436865636b5769746e65737364320051c576000f4f574e45522069732063616c6c6572c46168124e656f2e52756e74696d652e4e6f7469667951616c756600616c7566',false,01,'')
function Deploy(myaddress, myprivatekey, mygasfee, nodeToCall, networkToCall, contract_script, storage = 0x00, returntype = '05', par = '') {

    if(returntype.length == 1)
       returntype = returntype[0]; // remove array if single element


    if(contract_script == "")
    {
	alert("ERROR (DEPLOY): Empty script (avm)!");
    	return;
    }

    var contract_scripthash = getScriptHashFromAVM(contract_script);

    //Notify user if contract exists
    getContractState(contract_scripthash, true);
    if(contract_scripthash == "" || !Neon.default.is.scriptHash(contract_scripthash))
    {
	alert("ERROR (DEPLOY): Contract scripthash " + contract_scripthash + " is not being recognized as a scripthash.");
    	return;
    }

    const sb = Neon.default.create.scriptBuilder();
    sb.emitPush(Neon.u.str2hexstring('appdescription')) // description
      .emitPush(Neon.u.str2hexstring('email')) // email
      .emitPush(Neon.u.str2hexstring('author')) // author
      .emitPush(Neon.u.str2hexstring('v1.0')) // code_version
      .emitPush(Neon.u.str2hexstring('appname')) // name
      .emitPush(storage) // storage: {none: 0x00, storage: 0x01, dynamic: 0x02, storage+dynamic:0x03}
      .emitPush(returntype) // expects hexstring  (_emitString) // usually '05'
      .emitPush(par) // expects hexstring  (_emitString) // usually '0710'
      .emitPush(contract_script) //script
      .emitSysCall('Neo.Contract.Create');

    const config = {
      net: networkToCall,
      url: nodeToCall,
      script: sb.str,
      address: myaddress, //'AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y',//'ARCvt1d5qAGzcHqJCWA2MxvhTLQDb9dvjQ',
      privateKey: myprivatekey, //'1dd37fba80fec4e6a6f13fd708d8dcb3b29def768017052f6c930fa1c5d90bbb',//'4f0d41eda93941d106d4a26cc90b4b4fddc0e03b396ac94eb439c5d9e0cd6548',
      gas: mygasfee //0
    }

    Neon.default.doInvoke(config).then(res => {
      	console.log(res);

     if(typeof(res.response.result) == "boolean") // 2.X
       createNotificationOrAlert("Deploy","Response: " + res.response.result, 7000);
     else  // 3.X
       createNotificationOrAlert("Deploy","Response: " + res.response.result.succeed + " Reason:" + res.response.result.reason + " id " + res.tx.hash, 7000);

    if(res.response.result) {
      if(typeof(res.response.result) == "boolean") // 2.X
         updateVecRelayedTXsAndDraw(res.response.txid, "Deploy", $("#contracthashjs").val(),"DeployParams");
      else // 3.X
         updateVecRelayedTXsAndDraw(res.tx.hash, "Deploy", $("#contracthashjs").val(),"DeployParams");
    }

    }).catch(err => {
     	console.log(err);
	createNotificationOrAlert("Deploy ERROR","Response: " + err, 5000);
  });

  document.getElementById('divNetworkRelayed').scrollIntoView();
}

function createNotificationOrAlert(notifyTitle, notifyBody, notificationTimeout)
{
    if(ALLOW_NOTIFICATIONS_ALERTS){
	  var permission = (Notification.permission === "granted");
     	  if (!permission) {
          	//alert(Notification.permission);
                //console.log(Notification.permission);
	  	Notification.requestPermission();
	  }

	  var options = {
	      body: notifyBody,
	      icon: 'public/images/prototype-icon-eco.png'
	  }

	  if(Notification.permission === "granted"){
		var n = new Notification(notifyTitle, options);
	 	setTimeout(function() {n.close.bind(n)}, notificationTimeout);
	  } else {
		//For devices that do not allow notifications
          	alert(notifyTitle + " : " + notifyBody);
	  }
     }else
     {
	console.log(notifyTitle + " : " + notifyBody);
     }
}

function getStorage( scripthashContext, key, url )
{
  query = Neon.rpc.Query.getStorage( scripthashContext, key );
  response = query.execute(url);
  console.log(response);
  return response;
}


/*
function CreateRawTx( rawData ){
  // just for test
  //query = Neon.rpc.Query.sendRawTransaction(rawData);
  query = Neon.rpc.Query.sendRawTransaction('800000014BFA9098EC9C5B95E4EC3045A2A2D04A10F12228A3267A3AC65265428ABDC1D3010002E72D286979EE6CB1B7E65DFDDFB2E384100B8D148E7758DE42E4168B71792C6000E1F505000000004E75C523C4D431DAFED515E5E230F11A4DB5A80FE72D286979EE6CB1B7E65DFDDFB2E384100B8D148E7758DE42E4168B71792C6000EF54A91C000000 513FF03F3A5648BE47CC82F6571251F57173CF8601060004303231347755C56B6C766B00527AC46C766B51527AC4616168164E656F2E52756E74696D652E47657454726967676572009C6C766B52527AC46C766B52C3642A00616C766B00C30430323134876C766B53527AC46C766B53C3640E00516C766B54527AC4620F0061006C766B54527AC46203006C766B54C3616C7566');
  response = query.execute(BASE_PATH_CLI);
  console.log(response);
}
*/

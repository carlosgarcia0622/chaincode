'use strict';

const { Contract } = require('fabric-contract-api');

class Medicine extends Contract{

async initLedger(ctx){

    const medicines = [
        {
            id:'01',
            name:'acetaminofen',
            owner:'Laboratorio',
            description:'Medicine 01',
            state: 'Creado'
        },
        {
            id:'02',
            name:'advil',
            owner:'Laboratorio',
            description:'Medicine 02',
            state: 'Creado'
        },
        {
            id:'03',
            name:'noraver',
            owner:'Laboratorio',
            description:'Medicine 03',
            state: 'Creado'
        }
    ]

    for(let i =0; i<medicines.length;i++){

        await ctx.stub.putState('Medicine'+i,Buffer.from(JSON.stringify(medicines[i])));
        console.info('============= END : Initialize Ledger ===========');
    }
    

}

async queryMedicine(ctx, medicineNumber){
    const medicineAsBytes = await ctx.stub.getState(medicineNumber);
    if (!medicineAsBytes || medicineAsBytes.length === 0) {
        throw new Error(`${medicineNumber} does not exist`);
    }
    console.log(medicineAsBytes.toString());
    return medicineAsBytes.toString();
}


async changeState(ctx, medicineNumber, ownerTxn, stateTxn){

    const medicineAsBytes = await ctx.stub.getState(medicineNumber);

    if (!medicineAsBytes || medicineAsBytes.length === 0) {
        throw new Error(`${carNumber} does not exist`);
    }

    const medicine = JSON.parse(medicineAsBytes.toString());


    if(ownerTxn === 'Distribuidor' &&  stateTxn === 'Creado'){
        medicine.owner = 'Distribuidor';
    }
    else if( ownerTxn === 'Distribuidor' && stateTxn=== 'En Distribucion'){
        newmedicine.state= 'En Distribucion';
    }
    else if(ownerTxn === 'Transporador' && stateTxn=== 'En Distribucion'){
        medicine.owner = 'Transporador';
    }
    else if(ownerTxn === 'Transporador' && stateTxn=== 'En Transporte'){
        medicine.state = 'En Transporte';
    }
    else if(ownerTxn === 'Vendedor' && stateTxn=== 'En Transporte'){
        medicine.owner = 'Vendedor';
    }
    else if(ownerTxn === 'Vendedor' && stateTxn=== 'En Venta'){
        medicine.state = 'En Venta';
    }
    else if(ownerTxn === 'Vendedor' && stateTxn=== 'Vendido'){
        medicine.state = 'Vendido';
    }

    await ctx.stub.putState(medicineNumber, Buffer.from(JSON.stringify(medicine)));

}

async queryAllMedicines(ctx) {
    const startKey = 'Medicine0';
    const endKey = 'Medicine100';

    const iterator = await ctx.stub.getStateByRange(startKey, endKey);

    const allResults = [];
    while (true) {
        const res = await iterator.next();

        if (res.value && res.value.value.toString()) {
            console.log(res.value.value.toString('utf8'));

            const Key = res.value.key;
            let Record;
            try {
                Record = JSON.parse(res.value.value.toString('utf8'));
            } catch (err) {
                console.log(err);
                Record = res.value.value.toString('utf8');
            }
            allResults.push({ Key, Record });
        }
        if (res.done) {
            console.log('end of data');
            await iterator.close();
            console.info(allResults);
            return JSON.stringify(allResults);
        }
    }
}

async txnCrearMedicina(ctx,id, name, description){
    
    const medicine = {
            id:id,
            name:name,
            owner:'Laboratorio',
            description:description,
            state: 'Creado'
    }
    await ctx.stub.putState('Medicine'+medicine.id,Buffer.from(JSON.stringify(medicine)));

}

async txnDistribuirMedicina(ctx, id){
        
    let medicineNumber = ('Medicine'+id);
    let medicineAsBytes = await ctx.stub.getState(medicineNumber);

    if (!medicineAsBytes || medicineAsBytes.length === 0) {
        throw new Error(`${medicineNumber} does not exist`);
    }

    const medicine = JSON.parse(medicineAsBytes.toString());

    if (medicine.state !== 'Creado') {
        throw new Error(medicineNumber +' Debe tener estado \'Creado\' para ejecutar la transacción. Estado Actual : ' + medicine.state);
    }
    if(medicine.owner !== 'Laboratorio'){
        throw new Error(medicineNumber +' Debe tener propietatio \'Laboratorio\' para ejecutar la transacción. Propietario Actual : ' + medicine.owner);
    }

    medicine.owner = 'Distribuidor';
    medicine.state = 'En Distribucion';
            

    //Update Medicine
    
    await ctx.stub.putState(medicineNumber, Buffer.from(JSON.stringify(medicine)));
    return medicine.toBuffer();

}


async txnEnviarMedicina(ctx, id){
        
    let medicineNumber = ('Medicine'+id);
    let medicineAsBytes = await ctx.stub.getState(medicineNumber);

    if (!medicineAsBytes || medicineAsBytes.length === 0) {
        throw new Error(`${medicineNumber} does not exist`);
    }

    const medicine = JSON.parse(medicineAsBytes.toString());

    if (medicine.state !== 'En Distribucion') {
        throw new Error(medicineNumber +' Debe tener estado \'En Distribucion\' para ejecutar la transacción. Estado Actual : ' + medicine.state);
    }
    if(medicine.owner !== 'Distribuidor'){
        throw new Error(medicineNumber +' Debe tener propietatio \'Distribuidor\' para ejecutar la transacción. Propietario Actual : ' + medicine.owner);
    }

    medicine.owner = 'Transportador';
    medicine.state = 'En Transporte';
            

    //Update Medicine
    
    await ctx.stub.putState(medicineNumber, Buffer.from(JSON.stringify(medicine)));
    return medicine.toBuffer();

}

async txnEntregarMedicina(ctx, id){  //El transportador hace entrega del medicamento a la tienda
        
    let medicineNumber = ('Medicine'+id);
    let medicineAsBytes = await ctx.stub.getState(medicineNumber);

    if (!medicineAsBytes || medicineAsBytes.length === 0) {
        throw new Error(`${medicineNumber} does not exist`);
    }

    const medicine = JSON.parse(medicineAsBytes.toString());

    if (medicine.state !== 'En Transporte') {
        throw new Error(medicineNumber +' Debe tener estado \'En Transporte\' para ejecutar la transacción. Estado Actual : ' + medicine.state);
    }
    if(medicine.owner !== 'Laboratorio'){
        throw new Error(medicineNumber +' Debe tener propietatio \'Transportador\' para ejecutar la transacción. Propietario Actual : ' + medicine.owner);
    }

    medicine.owner = 'Vendedor';
    medicine.state = 'En Venta';
            

    //Update Medicine
    
    await ctx.stub.putState(medicineNumber, Buffer.from(JSON.stringify(medicine)));
    return medicine.toBuffer();

}


async txnVenderMedicina(ctx, id){  
        
    let medicineNumber = ('Medicine'+id);
    let medicineAsBytes = await ctx.stub.getState(medicineNumber);

    if (!medicineAsBytes || medicineAsBytes.length === 0) {
        throw new Error(`${medicineNumber} does not exist`);
    }

    const medicine = JSON.parse(medicineAsBytes.toString());

    if (medicine.state !== 'En Venta') {
        throw new Error(medicineNumber +' Debe tener estado \'En Venta\' para ejecutar la transacción. Estado Actual : ' + medicine.state);
    }
    if(medicine.owner !== 'Laboratorio'){
        throw new Error(medicineNumber +' Debe tener propietatio \'Vendedor\' para ejecutar la transacción. Propietario Actual : ' + medicine.owner);
    }

    medicine.owner = 'Cliente';
    medicine.state = 'Vendido';
            

    //Update Medicine
    
    await ctx.stub.putState(medicineNumber, Buffer.from(JSON.stringify(medicine)));
    return medicine.toBuffer();

}

}

module.exports = Medicine;
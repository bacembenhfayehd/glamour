import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import AddressModal from './AddressModal';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { clearErrors, clearSuccesses, createOrder } from '@/lib/features/order/orderSlice';

const OrderSummary = ({ totalPrice, items }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'DT';

    const router = useRouter();

    const addressList = useSelector(state => state.address.list);
    const { loadingCreateOrder, errorCreateOrder, successCreateOrder } = useSelector(state => state.orders);
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();

    const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [deliveryType, setDeliveryType] = useState('delivery');
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');

     useEffect(() => {
        if (successCreateOrder) {
            toast.success('Commande créée avec succès!');
            // Clear success state
            dispatch(clearSuccesses());
            // Redirect to orders page
            setTimeout(() => router.push('/orders'), 1500);
        }
    }, [successCreateOrder, dispatch, router]);

    // Handle order creation errors
    useEffect(() => {
        if (errorCreateOrder) {
            toast.error(errorCreateOrder);
            dispatch(clearErrors());
        }
    }, [errorCreateOrder, dispatch]);

    const handleCouponCode = async (event) => {
        event.preventDefault();
        
    }
    const handlePlaceOrder = async (e) => {
         e.preventDefault();

    // Validation
        if (!user?.phone && !selectedAddress?.phone) {
            toast.error('Le numéro de téléphone est requis');
            return;
        }

        if (deliveryType === 'delivery' && !selectedAddress) {
            toast.error('Veuillez sélectionner une adresse de livraison');
            return;
        }

        // Prepare order data
        const orderData = {
            items: items.map(item => ({
                product: item.productId || item._id,
                quantity: item.quantity
            })),
            deliveryType,
            phone: selectedAddress?.phone || user?.phone,
            notes: '',
            ...(deliveryType === 'delivery' && {
                shippingAddress: {
                    street: selectedAddress?.street,
                    city: selectedAddress?.city,
                    postalCode: selectedAddress?.zip
                }
            }),
            ...(paymentMethod && {
                paymentMethod
            })
        };

        // Dispatch create order action
        dispatch(createOrder(orderData));
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Récapitulatif du paiement</h2>
            <p className='text-slate-400 text-xs my-4'>Type de livraison</p>
            <div className='flex gap-2 items-center'>
                <input 
                    type="radio" 
                    id="delivery" 
                    onChange={() => setDeliveryType('delivery')} 
                    checked={deliveryType === 'delivery'} 
                    className='accent-gray-500' 
                />
                <label htmlFor="delivery" className='cursor-pointer'>Livraison à domicile</label>
            </div>
            <div className='flex gap-2 items-center mt-1'>
                <input 
                    type="radio" 
                    id="pickup" 
                    onChange={() => setDeliveryType('pickup')} 
                    checked={deliveryType === 'pickup'} 
                    className='accent-gray-500' 
                />
                <label htmlFor="pickup" className='cursor-pointer'>Retrait en magasin</label>
            </div>
            <p className='text-slate-400 text-xs my-4'>Mode de paiement</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="cash_on_delivery" name='payment' onChange={() => setPaymentMethod('cash_on_delivery')} checked={paymentMethod === 'cash_on_delivery'} className='accent-gray-500' />
                <label htmlFor="COD" className='cursor-pointer'>Paiement à la livraison</label>
            </div>
            <div className='flex gap-2 items-center mt-1'>
                <input type="radio" id="bank_transfer" name='payment' onChange={() => setPaymentMethod('bank_transfer')} checked={paymentMethod === 'bank_transfer'} className='accent-gray-500' />
                <label htmlFor="STRIPE" className='cursor-pointer'>Virement bancaire</label>
            </div>
            {deliveryType === 'delivery' && (<div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Addresse</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-center'>
                            <p>{selectedAddress.name}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zip}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer' size={18} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 && (
                                    <select className='border border-slate-400 p-2 w-full my-3 outline-none rounded' onChange={(e) => setSelectedAddress(addressList[e.target.value])} >
                                        <option value="">Sélectionner Addresse</option>
                                        {
                                            addressList.map((address, index) => (
                                                <option key={index} value={index}>{address.name}, {address.city}, {address.state}, {address.zip}</option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button className='flex items-center gap-1 text-slate-600 mt-1' onClick={() => setShowAddressModal(true)} >Ajouter Addresse <PlusIcon size={18} /></button>
                        </div>
                    )
                }
            </div>
            )}
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Sous-total:</p>
                        <p>Livraison:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{currency} {totalPrice.toLocaleString()}</p>
                        <p>gratuite</p>
                        {coupon && <p>{`-${currency}${(coupon.discount / 100 * totalPrice).toFixed(2)}`}</p>}
                    </div>
                </div>
                {
                    !coupon ? (
                        <form onSubmit={e => toast.promise(handleCouponCode(e), { loading: 'Checking Coupon...' })} className='flex justify-center gap-3 mt-3'>
                            <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Coupon Code' className='border border-slate-400 p-1.5 rounded w-full outline-none' />
                            <button className='bg-slate-600 text-white px-3 rounded hover:bg-slate-800 active:scale-95 transition-all'>Appliquer</button>
                        </form>
                    ) : (
                        <div className='w-full flex items-center justify-center gap-2 text-xs mt-2'>
                            <p>Code: <span className='font-semibold ml-1'>{coupon.code.toUpperCase()}</span></p>
                            <p>{coupon.description}</p>
                            <XIcon size={18} onClick={() => setCoupon('')} className='hover:text-red-700 transition cursor-pointer' />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between py-4'>
                <p>Total:</p>
                <p className='font-medium text-right'>{currency} {coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)).toFixed(2) : totalPrice.toLocaleString()}</p>
            </div>
            <button onClick={handlePlaceOrder} disabled={loadingCreateOrder} className='w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all'>{loadingCreateOrder ? 'Création de la commande...' : 'Passer commande'}</button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}

        </div>
    )
}

export default OrderSummary
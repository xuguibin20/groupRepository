/*
 * Copyright (C) 2005 - 2030 YGSoft.Inc All Rights Reserved.
 * YGSoft.Inc PROPRIETARY/CONFIDENTIAL.Use is subject to license terms.
 */
package com.ygsoft.necp.mapp.std.order.web.impl.context;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



import com.ygsoft.necp.component.genentity.spec.GenEntityContext;

import com.ygsoft.necp.mapp.std.order.web.service.domain.model.SellOrder;
import com.ygsoft.necp.mapp.std.order.web.service.dao.ISellOrderDao;
import com.ygsoft.necp.mapp.std.order.web.service.context.ISellOrderContext;
import com.ygsoft.necp.component.genentity.context.EntityContext;
import com.ygsoft.necp.core.service.dcispec.annotation.EventSource;

/**
 * SellOrder场景类.<br>
 *
 * @author 04192213 <br>
 * @version 1.0.0 2022-10-05 22:09:24<br>
 * @since JDK 1.8.0_144
 */
@Service
@Transactional
@EventSource
@EntityContext(classId = "aa1", typeId = "sellorder1")
public class SellOrderContext extends GenEntityContext<SellOrder, String, ISellOrderDao>
		implements ISellOrderContext {
		
	/**
	 * 构造函数.
	 */
	public SellOrderContext() {
		super();
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see com.ygsoft.necp.core.service.dcispec.GeneralContext#newModel()
	 */
	@Override
	protected SellOrder newModel() {
		return new SellOrder();
	}
	

 	/**
 	 * 查询订单详情
 	 *
 	 */
 	@Override
 	public SellOrder queryOrderInfo(String ddbh){
        return null;
 	}
 	/**
 	 * 查询订单
 	 *
 	 */
 	@Override
 	public String query(){
        return null;
 	}
 	/**
 	 * 新增订单
 	 *
 	 */
 	@Override
 	public String addOrder(String ddm, String shr, String shdz, String shdh, String spxx){
        return null;
 	}
 	/**
 	 * 发货
 	 *
 	 */
 	@Override
 	public boolean sendProduct(String fhzt, String fhdh){
        return false;
 	}
 	/**
 	 * 取消订单
 	 *
 	 */
 	@Override
 	public boolean cancelOrder(String ddbh){
        return false;
 	}
 	/**
 	 * 查询订单详情
 	 *
 	 */
 	@Override
 	public SellOrder queryOrderInfo(String ddbh){
        return null;
 	}

}

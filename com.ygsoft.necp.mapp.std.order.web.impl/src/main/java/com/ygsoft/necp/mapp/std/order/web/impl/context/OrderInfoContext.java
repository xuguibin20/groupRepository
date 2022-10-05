/*
 * Copyright (C) 2005 - 2030 YGSoft.Inc All Rights Reserved.
 * YGSoft.Inc PROPRIETARY/CONFIDENTIAL.Use is subject to license terms.
 */
package com.ygsoft.necp.mapp.std.order.web.impl.context;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import com.ygsoft.necp.component.genentity.spec.GenEntityContext;

import com.ygsoft.necp.mapp.std.order.web.service.domain.model.OrderInfo;
import com.ygsoft.necp.mapp.std.order.web.service.dao.IOrderInfoDao;
import com.ygsoft.necp.mapp.std.order.web.service.context.IOrderInfoContext;
import com.ygsoft.necp.component.genentity.context.EntityContext;
import com.ygsoft.necp.core.service.dcispec.annotation.EventSource;

/**
 * OrderInfo场景类.<br>
 *
 * @author 04192213 <br>
 * @version 1.0.0 2022-10-05 22:09:23<br>
 * @since JDK 1.8.0_144
 */
@Service
@Transactional
@EventSource
@EntityContext(classId = "aa1", typeId = "orderinfo1")
public class OrderInfoContext extends GenEntityContext<OrderInfo, String, IOrderInfoDao>
		implements IOrderInfoContext {
		
	/**
	 * 构造函数.
	 */
	public OrderInfoContext() {
		super();
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see com.ygsoft.necp.core.service.dcispec.GeneralContext#newModel()
	 */
	@Override
	protected OrderInfo newModel() {
		return new OrderInfo();
	}
	


}

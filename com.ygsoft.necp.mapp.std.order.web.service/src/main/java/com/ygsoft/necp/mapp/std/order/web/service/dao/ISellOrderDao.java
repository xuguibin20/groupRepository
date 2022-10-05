/*
 * Copyright (C) 2005 - 2030 YGSoft.Inc All Rights Reserved.
 * YGSoft.Inc PROPRIETARY/CONFIDENTIAL.Use is subject to license terms.
 */
package com.ygsoft.necp.mapp.std.order.web.service.dao;

import org.springframework.stereotype.Repository;

import com.ygsoft.necp.component.genentity.spec.IGenEntityDao;
import com.ygsoft.necp.mapp.std.order.web.service.domain.model.SellOrder;

/**
 * ISellOrderDao数据访问类.<br>
 *
 * @author 04192213 <br>
 * @version 1.0.0 2022-10-05 22:09:23<br>
 * @since JDK 1.8.0_144
 */
@Repository
public interface ISellOrderDao extends IGenEntityDao<SellOrder, String> {
	

}

/*
 * Copyright (C) 2005 - 2030 YGSoft.Inc All Rights Reserved.
 * YGSoft.Inc PROPRIETARY/CONFIDENTIAL.Use is subject to license terms.
 */
package com.ygsoft.necp.mapp.std.order.web.service.domain.model;
import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Index;
import javax.persistence.Table;

import com.ygsoft.ecp.core.framework.annotations.Topic;
import com.ygsoft.necp.component.genentity.domain.model.GenBizEntity;

/**
 * OrderInfo的POJO类.<br>
 * 
 * @author 04192213 <br>
 * @version 1.0.0 2022-10-05 22:09:23<br>
 * @since JDK 1.8.0_144
 */
@Entity
@Table(name = "ORDERINFO", indexes = {})
@Topic(classId = "aa1", typeId = "orderinfo1")
public class OrderInfo extends GenBizEntity {
	/**
	 * 序列化版本.
	 */
	private static final long serialVersionUID = 1L;
												
	/**
	 * 商品名称.
	 */
	private String spmc;
											
	/**
	 * 商品规格.
	 */
	private String spgg;
											
	/**
	 * 商品数量.
	 */
	private int spsl;
											
	/**
	 * 商品单价.
	 */
	private BigDecimal spsj;
											
	/**
	 * 商品金额.
	 */
	private BigDecimal spje;
	
	/**
     * 商品名称的get方法
     * @return spmc
     */
	@Column(name = "spmc", nullable = true, length = 50)
    public String getSpmc() {
        return spmc;
    }
		
    /**
     * 设置商品名称.
     * @param spmc
     */
    public void setSpmc(final String newSpmc) {
		this.spmc = newSpmc;
	}
	
	/**
     * 商品规格的get方法
     * @return spgg
     */
	@Column(name = "spgg", nullable = true, length = 50)
    public String getSpgg() {
        return spgg;
    }
		
    /**
     * 设置商品规格.
     * @param spgg
     */
    public void setSpgg(final String newSpgg) {
		this.spgg = newSpgg;
	}
	
	/**
     * 商品数量的get方法
     * @return spsl
     */
	@Column(name = "spsl", nullable = true)
    public int getSpsl() {
        return spsl;
    }
		
    /**
     * 设置商品数量.
     * @param spsl
     */
    public void setSpsl(final int newSpsl) {
		this.spsl = newSpsl;
	}
	
	/**
     * 商品单价的get方法
     * @return spsj
     */
	@Column(name = "spsj", nullable = true, precision = 18, scale = 2)
    public BigDecimal getSpsj() {
        return spsj;
    }
		
    /**
     * 设置商品单价.
     * @param spsj
     */
    public void setSpsj(final BigDecimal newSpsj) {
		this.spsj = newSpsj;
	}
	
	/**
     * 商品金额的get方法
     * @return spje
     */
	@Column(name = "spje", nullable = true, precision = 18, scale = 2)
    public BigDecimal getSpje() {
        return spje;
    }
		
    /**
     * 设置商品金额.
     * @param spje
     */
    public void setSpje(final BigDecimal newSpje) {
		this.spje = newSpje;
	}
}

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Svg, Path } from '@react-pdf/renderer';
import { Challan, Company, Party } from '@/types';
import { numberToWords } from '@/lib/number-to-words';

// Register standard fonts
Font.register({
  family: 'Gujarati',
  fonts: [
    { src: '/fonts/NotoSansGujarati-Regular.ttf' },
    { src: '/fonts/NotoSansGujarati-Bold.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: '#FFFFFF',
    padding: 0,
  },
  // --- HEADER SECTION ---
  headerContainer: {
    backgroundColor: '#FCEFD8', // Cream background
    paddingTop: 8,
    paddingBottom: 0,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  gstinText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  mobileText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  religiousTextWrapper: {
    alignItems: 'center',
    marginBottom: 5,
  },
  religiousText: {
    color: '#D83121', // Red color
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Gujarati',
  },
  companyName: {
    fontSize: 35,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#4A4036',
    fontFamily: 'Times-Roman',
  },
  companyTagline: {
    fontSize: 15,
    textAlign: 'center',
    color: '#333333',
    marginBottom: 10,
  },
  addressBar: {
    backgroundColor: '#F49B36', // Orange
    paddingVertical: 5,
    alignItems: 'center',
  },
  addressText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },

  // --- CUSTOMER SECTION ---
  customerSection: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 15,
    justifyContent: 'space-between',
  },
  customerLeft: {
    width: '50%',
    paddingRight: 20,
  },
  customerRight: {
    width: '40%',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  fieldLabel: {
    width: 60,
    fontSize: 10,
  },
  fieldLabelRight: {
    width: 70,
    fontSize: 10,
  },
  fieldLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 1,
    minHeight: 12,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },

  // --- TABLE SECTION ---
  tableContainer: {
    marginHorizontal: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#EBEBEB',
    minHeight: 30,
    alignItems: 'center',
    marginBottom: 8,
  },
  thDesc: { width: '41%', textAlign: 'center', fontSize: 10, fontFamily: 'Helvetica-Bold', borderRightWidth: 1, borderColor: '#000000', paddingVertical: 5 },
  thPieces: { width: '12%', textAlign: 'center', fontSize: 10, fontFamily: 'Helvetica-Bold', borderRightWidth: 1, borderColor: '#000000', paddingVertical: 2, alignItems: 'center', justifyContent: 'center' },
  thMeters: { width: '14%', textAlign: 'center', fontSize: 10, fontFamily: 'Helvetica-Bold', borderRightWidth: 1, borderColor: '#000000', paddingVertical: 2, alignItems: 'center', justifyContent: 'center' },
  thRate: { width: '13%', textAlign: 'center', fontSize: 10, fontFamily: 'Helvetica-Bold', borderRightWidth: 1, borderColor: '#000000', paddingVertical: 2, alignItems: 'center', justifyContent: 'center' },
  thAmount: { width: '20%', textAlign: 'center', fontSize: 10, fontFamily: 'Helvetica-Bold', paddingVertical: 5 },

  tableBody: {
    flexDirection: 'row',
    height: 290, // Fixed height to guarantee single-page layout
    borderWidth: 1,
    borderColor: '#000000',
  },
  tdDesc: { width: '41%', borderRightWidth: 1, borderColor: '#000000', flexDirection: 'column', justifyContent: 'space-between' },
  tdPieces: { width: '12%', borderRightWidth: 1, borderColor: '#000000', flexDirection: 'column', justifyContent: 'space-between' },
  tdMeters: { width: '14%', borderRightWidth: 1, borderColor: '#000000', flexDirection: 'column', justifyContent: 'space-between' },
  tdRate: { width: '13%', borderRightWidth: 1, borderColor: '#000000', flexDirection: 'column', justifyContent: 'space-between' },
  tdAmount: { width: '20%', flexDirection: 'column', justifyContent: 'space-between' },

  tableRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  cellText: { fontSize: 11 },

  // (Table Bottom Wrapper Removed)
  bottomLabelRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bottomLabel: { width: 95, fontSize: 10, fontFamily: 'Helvetica-Bold' },
  noDyeingText: {
    marginTop: 10,
    marginLeft: 20,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  taxRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000000',
    height: 18,
    alignItems: 'center',
  },
  taxLabel: { width: '50%', fontSize: 9, paddingLeft: 4 },
  taxValue: { width: '50%', fontSize: 9, textAlign: 'right', paddingRight: 4 },
  totalRow: {
    flexDirection: 'row',
    height: 20,
    alignItems: 'center',
  },
  totalLabel: { width: '40%', fontSize: 10, fontFamily: 'Helvetica-Bold', paddingLeft: 4 },
  totalValue: { width: '60%', fontSize: 10, fontFamily: 'Helvetica-Bold', textAlign: 'right', paddingRight: 4 },

  // --- BANK & SIGNATURE SECTION ---
  bottomSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  bankDetails: {
    width: '50%',
    height: 100,
    justifyContent: 'space-between',
  },
  bankTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
  },
  bankText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },

  preparedBySection: {
    gap: 5,
  },
  preparedLabel: {
    width: 75,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#343c5b',
  },
  preparedLine: {
    width: 100,
    borderBottomWidth: 1,
    borderColor: '#343c5b',
  },
  signatureSection: {
    width: '50%',
    height: 100,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  forCompanyText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#3d302d',
  },
  signatureLine: {
    width: 180,
    borderTopWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    paddingTop: 5,
  },
  signatureText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },

  // --- TERMS SECTION ---
  termsContainer: {
    marginTop: 'auto',
  },
  termsTitle: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: '#343c5b',
    marginLeft: 20,
    marginBottom: 2,
  },
  termsFooterBox: {
    backgroundColor: '#FCEFD8',
    paddingTop: 5,
    paddingBottom: 5,
    paddingHorizontal: 20,
    height: 80,
  },
  termBullet: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bulletPoint: {
    width: 12,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  termText: {
    fontSize: 9,
    flex: 1,
  },
});

interface ChallanPDFProps {
  challan: Challan;
  company: Company;
  party?: Party;
}

export function ChallanPDF({ challan, company, party }: ChallanPDFProps) {
  // Calculate totals
  const totalMeters = (challan.items || []).reduce((sum, item) => sum + (item.meter || 0), 0);
  const totalAmount = (challan.items || []).reduce((sum, item) => sum + (item.amount || 0), 0);

  // Pad items to exactly 12 rows for consistent table layout height
  const MAX_ROWS = 12;
  const displayItems = Array(MAX_ROWS).fill(null).map((_, i) => {
    return (challan.items && challan.items[i]) ? challan.items[i] : null;
  });

  // Assuming a generic tax of 5% total if we don't have split CGST/SGST in mock data yet
  // In a real app, this comes from the invoice math.
  const cgst = (totalAmount * 2.5) / 100;
  const sgst = (totalAmount * 2.5) / 100;
  const igst = 0;
  const grandTotal = totalAmount + cgst + sgst + igst;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <Text style={styles.gstinText}>GSTIN: {company.gst_number || '-'}</Text>
            </View>
            <View style={[styles.religiousTextWrapper, { flex: 1 }]}>
              <Text style={styles.religiousText}>|| શ્રી ૧| ||</Text>
              <Text style={styles.religiousText}>|| શ્રી ગણેશાય નમઃ ||</Text>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Svg viewBox="0 0 24 24" width="12" height="12" style={{ marginRight: 4 }}>
                <Path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.mobileText}>{company.phone || '-'}</Text>
            </View>
          </View>
          <Text style={styles.companyName}>{(company.name || '').toUpperCase()}</Text>
          <Text style={styles.companyTagline}>Manufacturers : Art Silk Cloth</Text>

          <View style={styles.addressBar}>
            <Text style={styles.addressText}>{company.address || 'Survey No.8, Plot No.29/1, Mahaprabhu Nagar, Limbayat, Surat.'}</Text>
          </View>
        </View>

        {/* CUSTOMER SECTION */}
        <View style={styles.customerSection}>
          <View style={styles.customerLeft}>
            <Text style={styles.sectionTitle}>Billed To:</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Name :</Text>
              <Text style={styles.fieldLine}>{party?.name || ''}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Address:</Text>
              <Text style={styles.fieldLine}>{party?.address || ''}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}></Text>
              <Text style={styles.fieldLine}>{party?.city ? `${party.city}, ${party.state}` : ''}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Gst no. :</Text>
              <Text style={styles.fieldLine}>{party?.gst_number || ''}</Text>
            </View>
          </View>

          <View style={styles.customerRight}>
            <View style={styles.fieldRow}>
              <Text style={[styles.sectionTitle, { marginBottom: 0, width: 70 }]}>Date:</Text>
              <Text style={styles.fieldLine}>{new Date(challan.date).toLocaleDateString('en-GB')}</Text>
            </View>
            <View style={[styles.fieldRow, { marginTop: 15 }]}>
              <Text style={styles.fieldLabelRight}>Bill No:</Text>
              <Text style={styles.fieldLine}>{challan.bill_number || ''}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabelRight}>Challan No:</Text>
              <Text style={styles.fieldLine}>{challan.challan_number}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabelRight}>HSN Code:</Text>
              <Text style={styles.fieldLine}>5407</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabelRight}>Broker:</Text>
              <Text style={styles.fieldLine}>{challan.broker || '-'}</Text>
            </View>
          </View>
        </View>

        {/* TABLE SECTION */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.thDesc}>Description of Goods</Text>
            <View style={styles.thPieces}>
              <Text>Total</Text>
              <Text>Pieces</Text>
            </View>
            <View style={styles.thMeters}>
              <Text>Total</Text>
              <Text>Mts./Kgs</Text>
            </View>
            <View style={styles.thRate}>
              <Text>Rate Per</Text>
              <Text>Mtrs.</Text>
            </View>
            <Text style={styles.thAmount}>Amount</Text>
          </View>

          <View style={styles.tableBody}>
            <View style={styles.tdDesc}>
              <View style={{ padding: 5 }}>
                {displayItems.map((item, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={styles.cellText}>{item ? `${item.quality || ''} ${item.fabric_name || ''}`.trim() : ' '}</Text>
                  </View>
                ))}
              </View>
              <View style={{ padding: 5, paddingBottom: 10 }}>
                <View style={[styles.bottomLabelRow, { marginBottom: 15 }]}>
                  <Text style={styles.bottomLabel}>Delivered By:</Text>
                  <Text style={[styles.cellText, { fontFamily: 'Helvetica-Bold' }]}>
                    {challan.driver_name || '-'}
                  </Text>
                </View>
                <View style={[styles.bottomLabelRow, { marginBottom: 6 }]}>
                  <Text style={styles.bottomLabel}>Payment Within:</Text>
                  <Text style={styles.cellText}>{challan.payment_within_value ? `${challan.payment_within_value} ${challan.payment_within_unit}` : ''}</Text>
                </View>
                <View style={[styles.bottomLabelRow, { marginBottom: 6, marginTop: 3 }]}>
                  <Text style={styles.bottomLabel}>Due Date:</Text>
                  <Text style={styles.cellText}>{challan.due_date ? new Date(challan.due_date).toLocaleDateString('en-GB') : ''}</Text>
                </View>
                <View style={[styles.bottomLabelRow, { alignItems: 'flex-start' }]}>
                  <Text style={styles.bottomLabel}>Rupees:</Text>
                  <Text style={[styles.cellText, { flex: 1, flexWrap: 'wrap', lineHeight: 1.4, marginTop: 3 }]}>{numberToWords(Math.round(grandTotal))}</Text>
                </View>
                <View style={{ height: 10 }} />
                <Text style={styles.noDyeingText}>NO DYEING GUARANTEE</Text>
              </View>
            </View>

            <View style={styles.tdPieces}>
              <View style={{ padding: 5 }}>
                {displayItems.map((item, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={[styles.cellText, { width: '100%', textAlign: 'center' }]}>{item ? '1' : ' '}</Text>
                  </View>
                ))}
              </View>
              <View />
            </View>

            <View style={styles.tdMeters}>
              <View style={{ padding: 5 }}>
                {displayItems.map((item, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={[styles.cellText, { width: '100%', textAlign: 'center' }]}>{item ? item.meter : ' '}</Text>
                  </View>
                ))}
              </View>
              <View />
            </View>

            <View style={styles.tdRate}>
              <View style={{ padding: 5 }}>
                {displayItems.map((item, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={[styles.cellText, { width: '100%', textAlign: 'center' }]}>{item ? item.rate : ' '}</Text>
                  </View>
                ))}
              </View>
              <View />
            </View>

            <View style={styles.tdAmount}>
              <View style={{ padding: 5 }}>
                {displayItems.map((item, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={[styles.cellText, { width: '100%', textAlign: 'right' }]}>{item ? (item.amount || 0).toFixed(2) : ' '}</Text>
                  </View>
                ))}
              </View>

              <View style={{ borderTopWidth: 1, borderColor: '#000000' }}>
                <View style={styles.taxRow}>
                  <Text style={styles.taxLabel}>CGST  %</Text>
                  <Text style={styles.taxValue}>{cgst.toFixed(2)}</Text>
                </View>
                <View style={styles.taxRow}>
                  <Text style={styles.taxLabel}>SGST  %</Text>
                  <Text style={styles.taxValue}>{sgst.toFixed(2)}</Text>
                </View>
                <View style={styles.taxRow}>
                  <Text style={styles.taxLabel}>IGST  %</Text>
                  <Text style={styles.taxValue}>{igst.toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{grandTotal.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* BANK DETAILS & SIGNATURE */}
        <View style={styles.bottomSection}>
          <View style={styles.bankDetails}>
            <View>
              <Text style={styles.bankTitle}>Bank Details:</Text>
              <Text style={styles.bankText}>THE SUTEXT CO.OPERATIVE BANK LTD.</Text>
              <Text style={styles.bankText}>A/C : 001460011000199</Text>
              <Text style={styles.bankText}>IFC CODE : SUTB248014</Text>
            </View>

            <View style={styles.preparedBySection}>
              <View style={styles.fieldRow}>
                <Text style={styles.preparedLabel}>Prepared By :</Text>
                <Text style={styles.preparedLine}></Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.preparedLabel}>Checked By :</Text>
                <Text style={styles.preparedLine}></Text>
              </View>
            </View>
          </View>

          <View style={styles.signatureSection}>
            <View style={{ alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
              <Text style={styles.forCompanyText}>For, {company.name}</Text>
              <View style={styles.signatureLine}>
                <Text style={styles.signatureText}>SIGNATURE</Text>
              </View>
            </View>
          </View>
        </View>

        {/* TERMS FOOTER */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsTitle}>TERMS:</Text>
          <View style={styles.termsFooterBox}>
            <View style={styles.termBullet}><Text style={styles.bulletPoint}>•</Text><Text style={styles.termText}>payment to be made by A/c. payee's cheque only.</Text></View>
            <View style={styles.termBullet}><Text style={styles.bulletPoint}>•</Text><Text style={styles.termText}>Any complaint for the goods should be made within 1 day after that no complaint will be entertained</Text></View>
            <View style={styles.termBullet}><Text style={styles.bulletPoint}>•</Text><Text style={styles.termText}>interest @24% per annum will be charged after due date of the bill.</Text></View>
            <View style={styles.termBullet}><Text style={styles.bulletPoint}>•</Text><Text style={styles.termText}>we are not responsible for any loss or damage during transit.</Text></View>
            <View style={styles.termBullet}><Text style={styles.bulletPoint}>•</Text><Text style={styles.termText}>we reserve the right of recovery before due date at any time.</Text></View>
            <View style={styles.termBullet}><Text style={styles.bulletPoint}>•</Text><Text style={styles.termText}>disputes will be settled in SURAT Courts only.</Text></View>
            <View style={styles.termBullet}><Text style={styles.bulletPoint}>•</Text><Text style={styles.termText}>personally selected goods will not be taken back.</Text></View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

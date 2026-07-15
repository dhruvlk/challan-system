import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Svg, Path } from '@react-pdf/renderer';
import type { Company, Customer, DeliveryChallan } from '@/types';
import { formatCompanyAddress } from '@/lib/pdf-utils';

Font.register({
  family: 'Gujarati',
  fonts: [
    { src: '/fonts/NotoSansGujarati-Regular.ttf' },
    { src: '/fonts/NotoSansGujarati-Bold.ttf', fontWeight: 'bold' },
  ],
});

const PAGE_BG = '#FFFFFF';
const HEADER_BG = '#F9E6BE';
const ORANGE = '#F4B14A';
const RED = '#E53935';
const BLACK = '#000000';
const FOOTER_BG = '#F9E6BE';
const GREY_BG = '#E5E5E5';
const NAVY_BLUE = '#1e2b4d';

const ROWS_PER_SIDE = 24;

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: PAGE_BG,
    padding: 0,
    flexDirection: 'column',
    flex: 1,
  },
  header: {
    backgroundColor: HEADER_BG,
    paddingTop: 5,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleLeft: {
    width: '30%',
    color: RED,
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  religiousWrap: {
    width: '40%',
    alignItems: 'center',
  },
  religiousText: {
    color: RED,
    fontFamily: 'Gujarati',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  phonesWrap: {
    width: '30%',
    alignItems: 'flex-end',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  phoneText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: BLACK,
  },
  companyWrap: {
    alignItems: 'center',
    marginTop: 5,
  },
  companyName: {
    fontSize: 35,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#4A4036',
    fontFamily: 'Times-Roman',
  },
  tagline: {
    fontFamily: 'Helvetica',
    fontSize: 13,
    marginTop: 2,
    color: BLACK,
  },
  gstin: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginTop: 4,
    color: BLACK,
  },
  addressBar: {
    backgroundColor: ORANGE,
    paddingVertical: 6,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  addressText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: BLACK,
  },
  metaSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    justifyContent: 'space-between',
  },
  metaCol: {
    width: '45%',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 9,
  },
  fieldLabel: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    marginRight: 6,
  },
  fieldLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: BLACK,
    minHeight: 14,
    justifyContent: 'flex-end',
    paddingBottom: 1,
  },
  fieldLineText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    paddingLeft: 4,
  },
  tablesWrap: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  table: {
    width: '49%',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: BLACK,
  },
  tr: {
    flexDirection: 'row',
  },
  th: {
    backgroundColor: GREY_BG,
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    textAlign: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: BLACK,
  },
  td: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    paddingTop: 2,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: BLACK,
    height: 16,
  },
  colSno: { width: '15%' },
  colTaka: { width: '33%' },
  colMts: { width: '26%' },
  colWt: { width: '26%' },
  totalLeftCell: {
    width: '48%',
    backgroundColor: GREY_BG,
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    paddingLeft: 6,
    paddingTop: 2,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: BLACK,
    textAlign: 'left',
    height: 16,
  },
  totalCell: {
    width: '26%',
    backgroundColor: GREY_BG,
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    textAlign: 'center',
    paddingTop: 2,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: BLACK,
    height: 16,
  },
  summaryBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 5,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: BLACK,
    backgroundColor: GREY_BG,
  },
  summaryCell: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderColor: BLACK,
    justifyContent: 'center',
  },
  summaryText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  footer: {
    backgroundColor: FOOTER_BG,
    marginTop: 6,
    paddingTop: 8,
    paddingBottom: 7,
    paddingHorizontal: 20,
  },
  footerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    marginTop: 0,
  },
  footerAck: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
    color: NAVY_BLUE,
  },
  footerCompany: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: RED,
    width: '28%',
    textAlign: 'center',
  },
  termItemWrap: {
    flexDirection: 'row',
    marginBottom: 2,
    width: '65%',
  },
  termBullet: {
    width: 12,
    fontSize: 9.5,
    color: BLACK,
  },
  termText: {
    flex: 1,
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.3,
    color: BLACK,
  },
  footerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  buyerSignWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '32%',
  },
  buyerSignText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginRight: 4,
    color: NAVY_BLUE,
  },
  buyerSignLine: {
    flex: 1,
    borderBottomWidth: 0.75,
    borderBottomColor: BLACK,
    marginBottom: 2,
  },
  guaranteeText: {
    fontFamily: 'Times-Roman',
    fontSize: 11,
    width: '36%',
    textAlign: 'center',
    color: BLACK,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  signatureWrap: {
    width: '28%',
    alignItems: 'center',
  },
  signatureLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: BLACK,
    marginBottom: 4,
  },
  signatureText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: BLACK,
  },
});

function PhoneIcon() {
  return (
    <Svg viewBox="0 0 24 24" width="12" height="12" style={{ marginRight: 4 }}>
      <Path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5C20.55,15.5 21,15.95 21,16.5V20C21,20.55 20.55,21 20,21C10.61,21 3,13.39 3,4C3,3.45 3.45,3 4,3H7.5C8.05,3 8.5,3.45 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" fill={BLACK} />
    </Svg>
  );
}

function formatPhones(phone?: string | null): string[] {
  if (!phone?.trim()) return [];
  return phone.split(/[,/|]+/).map((p) => p.trim()).filter(Boolean).slice(0, 2);
}

function splitAddressLines(address: string): [string, string] {
  if (!address) return ['', ''];
  if (address.length <= 40) return [address, ''];
  const cut = address.lastIndexOf(' ', 40);
  const idx = cut > 15 ? cut : 40;
  return [address.slice(0, idx).trim(), address.slice(idx).trim()];
}

type PdfItem = {
  taka_no: string;
  meters: number;
  weight: number;
};

/** Normalize DB/form item rows so PDF cells always receive real values. */
function normalizePdfItems(
  items: DeliveryChallan['items'] | undefined | null
): PdfItem[] {
  const list = Array.isArray(items) ? items : [];
  return [...list]
    .map((item, index) => ({
      sort_order: Number(item?.sort_order ?? index),
      taka_no: item?.taka_no != null ? String(item.taka_no).trim() : '',
      meters: Number(item?.meters) || 0,
      weight: Number(item?.weight) || 0,
    }))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(({ taka_no, meters, weight }) => ({ taka_no, meters, weight }));
}

function chunkItems(items: PdfItem[], size: number): PdfItem[][] {
  if (items.length === 0) return [[]];
  const pages: PdfItem[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

function formatCellNumber(value: number | undefined | null, hasItem: boolean): string {
  if (!hasItem) return ' ';
  return Number(value || 0).toFixed(2);
}

function ItemTable({
  rows,
  startIndex,
  totalMeters,
  totalWeight,
  showTotals,
}: {
  rows: Array<PdfItem | null>;
  startIndex: number;
  totalMeters: number;
  totalWeight: number;
  showTotals: boolean;
}) {
  return (
    <View style={styles.table}>
      <View style={styles.tr} wrap={false}>
        <Text style={[styles.th, styles.colSno]}>S.No.</Text>
        <Text style={[styles.th, styles.colTaka]}>Taka No.</Text>
        <Text style={[styles.th, styles.colMts]}>MTS.</Text>
        <Text style={[styles.th, { width: '26%' }]}>Wt.</Text>
      </View>

      {rows.map((item, i) => (
        <View key={i} style={styles.tr} wrap={false}>
          <Text style={[styles.td, styles.colSno]}>{String(startIndex + i)}</Text>
          <Text style={[styles.td, styles.colTaka]}>
            {item?.taka_no ? item.taka_no : ' '}
          </Text>
          <Text style={[styles.td, styles.colMts]}>
            {formatCellNumber(item?.meters, !!item)}
          </Text>
          <Text style={[styles.td, { width: '26%' }]}>
            {formatCellNumber(item?.weight, !!item)}
          </Text>
        </View>
      ))}

      <View style={styles.tr} wrap={false}>
        <Text style={styles.totalLeftCell}>Total</Text>
        <Text style={styles.totalCell}>
          {showTotals ? totalMeters.toFixed(2) : ' '}
        </Text>
        <Text style={styles.totalCell}>
          {showTotals ? totalWeight.toFixed(2) : ' '}
        </Text>
      </View>
    </View>
  );
}

interface DeliveryChallanPDFProps {
  challan: DeliveryChallan;
  company: Company;
  party?: Customer | null;
}

const DEFAULT_TERMS = [
  'No. claim or Dispute arising from change in quality or shortage in meter or\nany causes whatsoever will not be entertained once the goods are delivered.',
  '2% interest P.M. wil be charged if payment is not made within due date.',
  'The goods are despatches at your risk.',
  'Subject to SURAT jurisdiction',
];

const PAGE_CAPACITY = ROWS_PER_SIDE * 2;

export function DeliveryChallanPDF({ challan, company, party }: DeliveryChallanPDFProps) {
  const customer = party ?? challan.customer;
  const items = normalizePdfItems(challan.items);

  const computedMeters = items.reduce((sum, item) => sum + item.meters, 0);
  const computedWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const totalPieces = items.length > 0 ? items.length : Number(challan.total_pieces) || 0;
  const totalMeters = items.length > 0 ? computedMeters : Number(challan.total_meters) || 0;
  const totalWeight = items.length > 0 ? computedWeight : Number(challan.total_weight) || 0;

  const phones = formatPhones(company.phone);
  const companyAddress = formatCompanyAddress(company) || company.address || '';
  const customerAddress = [customer?.address, customer?.city, customer?.state, customer?.pincode]
    .filter(Boolean)
    .join(', ');
  const [addrLine1, addrLine2] = splitAddressLines(customerAddress);
  const displayTerms = DEFAULT_TERMS;

  const pages = chunkItems(items, PAGE_CAPACITY);

  return (
    <Document>
      {pages.map((pageItems, pageIndex) => {
        const leftItems = Array.from(
          { length: ROWS_PER_SIDE },
          (_, i) => pageItems[i] ?? null
        );
        const rightItems = Array.from(
          { length: ROWS_PER_SIDE },
          (_, i) => pageItems[i + ROWS_PER_SIDE] ?? null
        );
        const pageOffset = pageIndex * PAGE_CAPACITY;

        return (
          <Page key={pageIndex} size="A4" style={styles.page}>
            <View>
              {/* HEADER */}
              <View style={styles.header}>
                <View style={styles.topRow}>
                  <Text style={styles.titleLeft}>DELIVERY CHALLAN</Text>
                  <View style={styles.religiousWrap}>
                    <Text style={styles.religiousText}>|| શ્રી ૧ ||</Text>
                    <Text style={styles.religiousText}>|| શ્રી ગણેશાય નમ: ||</Text>
                  </View>
                  <View style={styles.phonesWrap}>
                    {phones.map((phone, i) => (
                      <View key={i} style={styles.phoneRow}>
                        <PhoneIcon />
                        <Text style={styles.phoneText}>{phone}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.companyWrap}>
                  <Text style={styles.companyName}>{(company.name || '').toUpperCase()}</Text>
                  <Text style={styles.tagline}>{company.tagline || ''}</Text>
                  <Text style={styles.gstin}>
                    {company.gst_number ? `GSTIN: ${company.gst_number}` : ''}
                  </Text>
                </View>
              </View>

              {/* ADDRESS BAR */}
              <View style={styles.addressBar}>
                <Text style={styles.addressText}>{companyAddress}</Text>
              </View>

              {/* META SECTION */}
              <View style={styles.metaSection}>
                <View style={styles.metaCol}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Name :</Text>
                    <View style={styles.fieldLine}>
                      <Text style={styles.fieldLineText}>{customer?.name || ''}</Text>
                    </View>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Address :</Text>
                    <View style={styles.fieldLine}>
                      <Text style={styles.fieldLineText}>{addrLine1}</Text>
                    </View>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={[styles.fieldLabel, { color: 'transparent' }]}>Address :</Text>
                    <View style={styles.fieldLine}>
                      <Text style={styles.fieldLineText}>{addrLine2}</Text>
                    </View>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Gst no. :</Text>
                    <View style={styles.fieldLine}>
                      <Text style={styles.fieldLineText}>{customer?.gst_number || ''}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.metaCol}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Date :</Text>
                    <View style={styles.fieldLine}>
                      <Text style={styles.fieldLineText}>
                        {challan.date ? new Date(challan.date).toLocaleDateString('en-GB') : ''}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Challan No :</Text>
                    <View style={styles.fieldLine}>
                      <Text style={styles.fieldLineText}>{challan.challan_number || ''}</Text>
                    </View>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Quality :</Text>
                    <View style={styles.fieldLine}>
                      <Text style={styles.fieldLineText}>{challan.quality || ''}</Text>
                    </View>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Broker :</Text>
                    <View style={styles.fieldLine}>
                      <Text style={styles.fieldLineText}>{challan.broker || ''}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* TABLES */}
              <View style={styles.tablesWrap}>
                <ItemTable
                  rows={leftItems}
                  startIndex={pageOffset + 1}
                  showTotals
                  totalMeters={totalMeters}
                  totalWeight={totalWeight}
                />
                <ItemTable
                  rows={rightItems}
                  startIndex={pageOffset + ROWS_PER_SIDE + 1}
                  showTotals={false}
                  totalMeters={0}
                  totalWeight={0}
                />
              </View>

              {/* SUMMARY BAR */}
              <View style={styles.summaryBar}>
                <View style={[styles.summaryCell, { alignItems: 'flex-start' }]}>
                  <Text style={styles.summaryText}>
                    Total Pieces: {totalPieces || ''}
                  </Text>
                </View>
                <View style={[styles.summaryCell, { alignItems: 'center' }]}>
                  <Text style={styles.summaryText}>
                    Total MTS. {totalMeters ? totalMeters.toFixed(2) : ''}
                  </Text>
                </View>
                <View style={[styles.summaryCell, { alignItems: 'flex-end' }]}>
                  <Text style={styles.summaryText}>
                    {company.hsn_code ? `HSN Code : ${company.hsn_code}` : ''}
                  </Text>
                </View>
              </View>
            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
              <View style={styles.footerTopRow}>
                <Text style={styles.footerAck}>
                  RECEIVED THE ABOVE GOODS IN GOOD AND SOUND CONDITION.
                </Text>
                <Text style={styles.footerCompany}>
                  {company.name ? `For, ${company.name}` : ''}
                </Text>
              </View>

              {displayTerms.map((term, i) => (
                <View key={i} style={styles.termItemWrap}>
                  <Text style={styles.termBullet}>•</Text>
                  <Text style={styles.termText}>{term}</Text>
                </View>
              ))}

              <View style={styles.footerBottomRow}>
                <View style={styles.buyerSignWrap}>
                  <Text style={styles.buyerSignText}>Buyer&apos;s Sign :</Text>
                  <View style={styles.buyerSignLine} />
                </View>
                <Text style={styles.guaranteeText}>NO DYEING GUARANTEE</Text>
                <View style={styles.signatureWrap}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureText}>SIGNATURE</Text>
                </View>
              </View>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}

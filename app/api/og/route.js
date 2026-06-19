import { ImageResponse } from 'next/og';
export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const a     = searchParams.get('a')   ?? 'Người Ấy';
  const b     = searchParams.get('b')   ?? 'Người Kia';
  const score = searchParams.get('score') ?? '??';
  const level = searchParams.get('level') ?? 'Tiên Tri Tình Yêu';
  const signA = searchParams.get('sa')  ?? '';
  const signB = searchParams.get('sb')  ?? '';
  const canA  = searchParams.get('ca')  ?? '';
  const canB  = searchParams.get('cb')  ?? '';
  const nhRel = searchParams.get('nh')  ?? '';
  const chiRel= searchParams.get('chi') ?? '';

  return new ImageResponse(
    <div style={{
      background:'linear-gradient(135deg,#080318 0%,#130a2e 50%,#0d0526 100%)',
      width:'1200px', height:'630px', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', fontFamily:'sans-serif',
      position:'relative', overflow:'hidden',
    }}>
      {/* Decorative circles */}
      <div style={{position:'absolute',width:'600px',height:'600px',borderRadius:'50%',
        border:'1px solid rgba(167,139,250,0.15)',top:'-100px',left:'-100px'}} />
      <div style={{position:'absolute',width:'400px',height:'400px',borderRadius:'50%',
        border:'1px solid rgba(236,72,153,0.12)',bottom:'-80px',right:'-80px'}} />
      <div style={{position:'absolute',width:'200px',height:'200px',borderRadius:'50%',
        background:'radial-gradient(circle,rgba(109,40,217,0.25),transparent)',
        top:'40px',right:'80px'}} />

      {/* Header tag */}
      <div style={{
        background:'rgba(109,40,217,0.3)',border:'1px solid rgba(167,139,250,0.4)',
        borderRadius:'999px',padding:'8px 24px',
        color:'#c4b5fd',fontSize:'22px',letterSpacing:'0.15em',marginBottom:'24px',
      }}>TIÊN TRI TÌNH YÊU</div>

      {/* Names */}
      <div style={{
        fontSize:'72px',fontWeight:'bold',
        backgroundImage:'linear-gradient(135deg,#f0e6ff,#f9a8d4,#c4b5fd)',
        backgroundClip:'text',color:'transparent',
        marginBottom:'8px',textAlign:'center',lineHeight:1.1,
      }}>{`${a}  &  ${b}`}</div>

      {/* Zodiac signs */}
      {(signA||signB) && (
        <div style={{color:'rgba(196,181,253,0.65)',fontSize:'26px',marginBottom:'28px'}}>
          {`${signA}${signA&&signB?'   •   ':''}${signB}`}
        </div>
      )}

      {/* Score orb + level */}
      <div style={{display:'flex',alignItems:'center',gap:'32px',marginBottom:'28px'}}>
        <div style={{
          width:'160px',height:'160px',borderRadius:'50%',
          border:'3px solid rgba(233,213,255,0.25)',
          background:'radial-gradient(circle,rgba(109,40,217,0.4),rgba(5,0,20,0.8))',
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
        }}>
          <div style={{fontSize:'68px',fontWeight:'bold',color:'#f9a8d4',lineHeight:1}}>{score}</div>
          <div style={{fontSize:'16px',color:'rgba(196,181,253,0.55)'}}>% tương hợp</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          <div style={{
            background:'rgba(109,40,217,0.3)',border:'1px solid rgba(167,139,250,0.4)',
            borderRadius:'12px',padding:'10px 22px',color:'#e9d5ff',fontSize:'26px',fontWeight:'bold',
          }}>{level}</div>
          {(canA||canB) && (
            <div style={{color:'rgba(196,181,253,0.5)',fontSize:'20px'}}>
              {canA&&canB?`Can ${canA}   •   Can ${canB}`:''}
            </div>
          )}
          {nhRel && <div style={{color:'rgba(196,181,253,0.45)',fontSize:'18px'}}>{nhRel}</div>}
          {chiRel && <div style={{color:'rgba(196,181,253,0.4)',fontSize:'18px'}}>{chiRel}</div>}
        </div>
      </div>

      {/* Footer */}
      <div style={{color:'rgba(109,40,217,0.5)',fontSize:'18px',position:'absolute',bottom:'20px'}}>
        Chỉ để giải trí — số phận là do bạn viết
      </div>
    </div>,
    { width:1200, height:630 }
  );
}

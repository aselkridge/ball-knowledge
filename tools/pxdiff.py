import zlib,struct,sys
def readpng(p):
    d=open(p,'rb').read(); i=8; idat=b''; ct=6
    while i<len(d):
        ln=struct.unpack('>I',d[i:i+4])[0]; typ=d[i+4:i+8]; data=d[i+8:i+8+ln]
        if typ==b'IHDR': w,h,bd,ct=struct.unpack('>IIBB',data[:10])
        if typ==b'IDAT': idat+=data
        i+=12+ln
    raw=zlib.decompress(idat); bpp=4 if ct==6 else 3
    stride=w*bpp; out=bytearray(); prev=bytearray(stride); k=0
    for y in range(h):
        f=raw[k]; k+=1; line=bytearray(raw[k:k+stride]); k+=stride
        for x in range(stride):
            a=line[x-bpp] if x>=bpp else 0; bb=prev[x]; cc=prev[x-bpp] if x>=bpp else 0
            if f==1: line[x]=(line[x]+a)&255
            elif f==2: line[x]=(line[x]+bb)&255
            elif f==3: line[x]=(line[x]+(a+bb)//2)&255
            elif f==4:
                pp=a+bb-cc; pa,pb,pc=abs(pp-a),abs(pp-bb),abs(pp-cc)
                pr=a if (pa<=pb and pa<=pc) else (bb if pb<=pc else cc)
                line[x]=(line[x]+pr)&255
        out+=line; prev=line
    return w,h,bpp,bytes(out)
w,h,bpp,A=readpng(sys.argv[1]); _,_,_,B=readpng(sys.argv[2])
n=0;tot=w*h;worst=0
for i in range(0,len(A),bpp):
    d=max(abs(A[i]-B[i]),abs(A[i+1]-B[i+1]),abs(A[i+2]-B[i+2]))
    if d>8:n+=1
    worst=max(worst,d)
print(f'{sys.argv[3]:6} {n:7} of {tot} px differ = {n/tot*100:5.1f}%   worst delta {worst}')
